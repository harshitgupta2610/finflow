import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';

@Injectable()
export class ItemService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllByCompany(companyId: string, category?: string, search?: string) {
    return this.prisma.item.findMany({
      where: {
        companyId,
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { hsnSac: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, companyId },
    });
    if (!item) {
      throw new NotFoundException('Item master record not found');
    }
    return item;
  }

  async create(userId: string, dto: CreateItemDto) {
    const existing = await this.prisma.item.findUnique({
      where: {
        companyId_sku: { companyId: dto.companyId, sku: dto.sku },
      },
    });

    if (existing) {
      throw new BadRequestException(`Item SKU '${dto.sku}' already exists`);
    }

    const item = await this.prisma.item.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        sku: dto.sku,
        hsnSac: dto.hsnSac,
        category: dto.category,
        unit: dto.unit ?? 'PCS',
        gstRate: dto.gstRate ?? 18.00,
        purchasePrice: dto.purchasePrice ?? 0.00,
        sellingPrice: dto.sellingPrice ?? 0.00,
        mrp: dto.mrp,
        reorderLevel: dto.reorderLevel,
        barcode: dto.barcode,
        isActive: dto.isActive ?? true,
      },
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'ITEM_CREATE',
      entity: 'Item',
      entityId: item.id,
      afterState: item,
    });

    return item;
  }

  async update(id: string, companyId: string, userId: string, dto: UpdateItemDto) {
    const existing = await this.findOne(id, companyId);

    const updated = await this.prisma.item.update({
      where: { id },
      data: {
        name: dto.name,
        sku: dto.sku,
        hsnSac: dto.hsnSac,
        category: dto.category,
        unit: dto.unit,
        gstRate: dto.gstRate,
        purchasePrice: dto.purchasePrice,
        sellingPrice: dto.sellingPrice,
        mrp: dto.mrp,
        reorderLevel: dto.reorderLevel,
        barcode: dto.barcode,
        isActive: dto.isActive,
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'ITEM_UPDATE',
      entity: 'Item',
      entityId: id,
      beforeState: existing,
      afterState: updated,
    });

    return updated;
  }

  async remove(id: string, companyId: string, userId: string) {
    const existing = await this.findOne(id, companyId);

    await this.prisma.item.delete({
      where: { id },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'ITEM_DELETE',
      entity: 'Item',
      entityId: id,
      beforeState: existing,
    });

    return { message: 'Item master record deleted successfully' };
  }
}
