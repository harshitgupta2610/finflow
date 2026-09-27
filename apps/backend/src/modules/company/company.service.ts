import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllByOrg(organizationId: string) {
    return this.prisma.company.findMany({
      where: { organizationId },
      include: {
        financialYears: true,
        branches: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, organizationId },
      include: {
        financialYears: true,
        branches: true,
      },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async create(organizationId: string, userId: string, dto: CreateCompanyDto) {
    const company = await this.prisma.$transaction(async (tx) => {
      const comp = await tx.company.create({
        data: {
          organizationId,
          legalName: dto.legalName,
          displayName: dto.displayName,
          pan: dto.pan,
          gstin: dto.gstin,
          address: dto.address,
          state: dto.state,
          pincode: dto.pincode,
          email: dto.email,
          phone: dto.phone,
          currency: 'INR',
        },
      });

      // Create initial Financial Year
      const currentYear = new Date().getFullYear();
      const nextYearShort = (currentYear + 1).toString().slice(-2);
      const fyName = `FY ${currentYear}-${nextYearShort}`;

      const fy = await tx.financialYear.create({
        data: {
          companyId: comp.id,
          name: fyName,
          startDate: new Date(`${currentYear}-04-01`),
          endDate: new Date(`${currentYear + 1}-03-31`),
          isCurrent: true,
          isLocked: false,
        },
      });

      await tx.company.update({
        where: { id: comp.id },
        data: { activeFinancialYearId: fy.id },
      });

      return comp;
    });

    await this.auditService.log({
      organizationId,
      companyId: company.id,
      userId,
      action: 'COMPANY_CREATE',
      entity: 'Company',
      entityId: company.id,
      afterState: company,
    });

    return company;
  }

  async update(id: string, organizationId: string, userId: string, dto: UpdateCompanyDto) {
    const existing = await this.findOne(id, organizationId);

    const updated = await this.prisma.company.update({
      where: { id },
      data: { ...dto },
    });

    await this.auditService.log({
      organizationId,
      companyId: id,
      userId,
      action: 'COMPANY_UPDATE',
      entity: 'Company',
      entityId: id,
      beforeState: existing,
      afterState: updated,
    });

    return updated;
  }
}
