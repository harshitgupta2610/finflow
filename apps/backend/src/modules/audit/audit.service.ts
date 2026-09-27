import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateAuditLogDto {
  organizationId?: string;
  companyId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  beforeState?: any;
  afterState?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        organizationId: dto.organizationId,
        companyId: dto.companyId,
        userId: dto.userId,
        action: dto.action,
        entity: dto.entity,
        entityId: dto.entityId,
        beforeState: dto.beforeState ? JSON.parse(JSON.stringify(dto.beforeState)) : undefined,
        afterState: dto.afterState ? JSON.parse(JSON.stringify(dto.afterState)) : undefined,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      },
    });
  }

  async findAll(organizationId?: string, companyId?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(companyId ? { companyId } : {}),
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
