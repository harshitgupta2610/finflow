import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/auth-extra.dto';
import { RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private auditService: AuditService,
  ) {}

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 3. Transactionally create Org, Company, FY, User, and UserRole
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Organization
      const orgCode = dto.organizationName.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10) + '_' + Date.now().toString().slice(-4);
      const org = await tx.organization.create({
        data: {
          name: dto.organizationName,
          code: orgCode,
        },
      });

      // Create Company
      const companyName = dto.companyName || `${dto.organizationName} Main`;
      const company = await tx.company.create({
        data: {
          organizationId: org.id,
          legalName: companyName,
          displayName: companyName,
          currency: 'INR',
        },
      });

      // Create Financial Year
      const currentYear = new Date().getFullYear();
      const nextYearShort = (currentYear + 1).toString().slice(-2);
      const fyName = `FY ${currentYear}-${nextYearShort}`;

      const fy = await tx.financialYear.create({
        data: {
          companyId: company.id,
          name: fyName,
          startDate: new Date(`${currentYear}-04-01`),
          endDate: new Date(`${currentYear + 1}-03-31`),
          isCurrent: true,
          isLocked: false,
        },
      });

      await tx.company.update({
        where: { id: company.id },
        data: { activeFinancialYearId: fy.id },
      });

      // Create User
      const user = await tx.user.create({
        data: {
          organizationId: org.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isActive: true,
          isVerified: true,
        },
      });

      // Assign OWNER role
      const ownerRole = await tx.role.findUnique({ where: { name: RoleName.OWNER } });
      if (ownerRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: ownerRole.id,
            companyId: company.id,
          },
        });
      }

      return { org, company, fy, user };
    });

    // 4. Audit Log
    await this.auditService.log({
      organizationId: result.org.id,
      companyId: result.company.id,
      userId: result.user.id,
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: result.user.id,
      ipAddress,
      userAgent,
    });

    // 5. Generate Auth Tokens
    const tokens = await this.generateTokens(result.user.id, result.user.email, result.org.id);
    await this.storeRefreshToken(result.user.id, tokens.refreshToken, ipAddress, userAgent);

    return {
      message: 'Registration successful',
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        organizationId: result.org.id,
        companyId: result.company.id,
      },
      tokens,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        organization: {
          include: {
            companies: {
              include: {
                financialYears: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or inactive account');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.auditService.log({
        organizationId: user.organizationId,
        userId: user.id,
        action: 'AUTH_LOGIN_FAILED',
        entity: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.organizationId);
    await this.storeRefreshToken(user.id, tokens.refreshToken, ipAddress, userAgent);

    await this.auditService.log({
      organizationId: user.organizationId,
      userId: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    const activeCompany = user.organization.companies[0] || null;
    const permissions = new Set<string>();
    const roles: string[] = [];

    user.userRoles.forEach((ur) => {
      roles.push(ur.role.name);
      ur.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.code);
      });
    });

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        organizationName: user.organization.name,
        company: activeCompany ? {
          id: activeCompany.id,
          legalName: activeCompany.legalName,
          displayName: activeCompany.displayName,
          activeFinancialYearId: activeCompany.activeFinancialYearId,
        } : null,
        roles,
        permissions: Array.from(permissions),
      },
      tokens,
    };
  }

  async refreshToken(dto: RefreshTokenDto, ipAddress?: string, userAgent?: string) {
    const tokenHash = crypto.createHash('sha256').update(dto.refreshToken).digest('hex');

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Revoke old token
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(storedToken.userId, storedToken.user.email, storedToken.user.organizationId);
    await this.storeRefreshToken(storedToken.userId, tokens.refreshToken, ipAddress, userAgent);

    return tokens;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    await this.auditService.log({
      userId,
      action: 'AUTH_LOGOUT',
      entity: 'User',
      entityId: userId,
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, organizationId: string) {
    const payload = { sub: userId, email, organizationId };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET', 'finflow_access_secret_super_key_2026_change_in_production'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'finflow_refresh_secret_super_key_2026_change_in_production'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string, ipAddress?: string, userAgent?: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });
  }
}
