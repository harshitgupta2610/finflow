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
    let items = await this.prisma.item.findMany({
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

    if (items.length === 0 && !search && !category) {
      await this.seedDefaultItems(companyId);
      items = await this.prisma.item.findMany({
        where: { companyId },
        orderBy: { name: 'asc' },
      });
    }

    return items;
  }

  async seedDefaultItems(companyId: string) {
    const defaults = [
      {
        companyId,
        name: 'Dell Latitude 15 3520 (i5, 16GB, 512GB SSD)',
        sku: 'DELL-LAT-3520',
        hsnSac: '84713010',
        category: 'Electronics',
        unit: 'PCS',
        gstRate: 18.0,
        purchasePrice: 48000.0,
        sellingPrice: 62000.0,
        mrp: 68000.0,
        reorderLevel: 5.0,
      },
      {
        companyId,
        name: 'LG UltraFine 27" 4K IPS Display Monitor',
        sku: 'LG-27UL500',
        hsnSac: '85285200',
        category: 'Electronics',
        unit: 'PCS',
        gstRate: 18.0,
        purchasePrice: 18500.0,
        sellingPrice: 26000.0,
        mrp: 29999.0,
        reorderLevel: 8.0,
      },
      {
        companyId,
        name: 'Logitech MX Master 3S Wireless Performance Mouse',
        sku: 'LOGI-MX-3S',
        hsnSac: '84716060',
        category: 'Accessories',
        unit: 'PCS',
        gstRate: 18.0,
        purchasePrice: 7200.0,
        sellingPrice: 10995.0,
        mrp: 12495.0,
        reorderLevel: 15.0,
      },
      {
        companyId,
        name: 'Ergonomic Mesh High-Back Executive Office Chair',
        sku: 'ERGO-CHAIR-X1',
        hsnSac: '94031090',
        category: 'Furniture',
        unit: 'PCS',
        gstRate: 18.0,
        purchasePrice: 9800.0,
        sellingPrice: 16500.0,
        mrp: 19500.0,
        reorderLevel: 12.0,
      },
      {
        companyId,
        name: 'Dual-Motor Electric Height Adjustable Standing Desk 140x70',
        sku: 'MOTO-DESK-140',
        hsnSac: '94031090',
        category: 'Furniture',
        unit: 'PCS',
        gstRate: 18.0,
        purchasePrice: 21000.0,
        sellingPrice: 32000.0,
        mrp: 38000.0,
        reorderLevel: 4.0,
      },
    ];

    for (const item of defaults) {
      await this.prisma.item.upsert({
        where: {
          companyId_sku: { companyId, sku: item.sku },
        },
        update: {},
        create: item,
      });
    }
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
