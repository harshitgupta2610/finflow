import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateFinancialYearDto } from './dto/financial-year.dto';

@Injectable()
export class FinancialYearService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findByCompany(companyId: string) {
    return this.prisma.financialYear.findMany({
      where: { companyId },
      orderBy: { startDate: 'desc' },
    });
  }

  async create(userId: string, dto: CreateFinancialYearDto) {
    const existing = await this.prisma.financialYear.findUnique({
      where: {
        companyId_name: {
          companyId: dto.companyId,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Financial Year '${dto.name}' already exists for this company`);
    }

    const fy = await this.prisma.$transaction(async (tx) => {
      if (dto.isCurrent) {
        await tx.financialYear.updateMany({
          where: { companyId: dto.companyId },
          data: { isCurrent: false },
        });
      }

      const created = await tx.financialYear.create({
        data: {
          companyId: dto.companyId,
          name: dto.name,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isCurrent: dto.isCurrent ?? false,
          isLocked: false,
        },
      });

      if (dto.isCurrent) {
        await tx.company.update({
          where: { id: dto.companyId },
          data: { activeFinancialYearId: created.id },
        });
      }

      return created;
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'FINANCIAL_YEAR_CREATE',
      entity: 'FinancialYear',
      entityId: fy.id,
      afterState: fy,
    });

    return fy;
  }

  async setAsCurrent(id: string, companyId: string, userId: string) {
    const fy = await this.prisma.financialYear.findUnique({ where: { id } });
    if (!fy || fy.companyId !== companyId) {
      throw new NotFoundException('Financial Year not found');
    }

    await this.prisma.$transaction([
      this.prisma.financialYear.updateMany({
        where: { companyId },
        data: { isCurrent: false },
      }),
      this.prisma.financialYear.update({
        where: { id },
        data: { isCurrent: true },
      }),
      this.prisma.company.update({
        where: { id: companyId },
        data: { activeFinancialYearId: id },
      }),
    ]);

    await this.auditService.log({
      companyId,
      userId,
      action: 'FINANCIAL_YEAR_SET_ACTIVE',
      entity: 'FinancialYear',
      entityId: id,
    });

    return { message: 'Active financial year updated successfully', activeFinancialYearId: id };
  }
}
