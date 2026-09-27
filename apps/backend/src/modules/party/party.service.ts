import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePartyDto, UpdatePartyDto } from './dto/party.dto';
import { PartyType } from '@prisma/client';

@Injectable()
export class PartyService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAllByCompany(companyId: string, type?: PartyType, search?: string) {
    return this.prisma.party.findMany({
      where: {
        companyId,
        ...(type ? { partyType: type } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { gstin: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const party = await this.prisma.party.findFirst({
      where: { id, companyId },
      include: {
        journalLines: {
          include: {
            journalEntry: {
              include: {
                voucher: true,
              },
            },
          },
          take: 20,
          orderBy: { journalEntry: { date: 'desc' } },
        },
      },
    });

    if (!party) {
      throw new NotFoundException('Party master record not found');
    }
    return party;
  }

  async create(userId: string, dto: CreatePartyDto) {
    const party = await this.prisma.party.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        partyType: dto.partyType,
        gstin: dto.gstin,
        pan: dto.pan,
        phone: dto.phone,
        email: dto.email,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
        state: dto.state,
        pincode: dto.pincode,
        creditLimit: dto.creditLimit,
        creditDays: dto.creditDays,
        openingBalance: dto.openingBalance ?? 0.00,
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'PARTY_CREATE',
      entity: 'Party',
      entityId: party.id,
      afterState: party,
    });

    return party;
  }

  async update(id: string, companyId: string, userId: string, dto: UpdatePartyDto) {
    const existing = await this.findOne(id, companyId);

    const updated = await this.prisma.party.update({
      where: { id },
      data: {
        name: dto.name,
        partyType: dto.partyType,
        gstin: dto.gstin,
        pan: dto.pan,
        phone: dto.phone,
        email: dto.email,
        billingAddress: dto.billingAddress,
        shippingAddress: dto.shippingAddress,
        state: dto.state,
        pincode: dto.pincode,
        creditLimit: dto.creditLimit,
        creditDays: dto.creditDays,
        openingBalance: dto.openingBalance,
        notes: dto.notes,
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'PARTY_UPDATE',
      entity: 'Party',
      entityId: id,
      beforeState: existing,
      afterState: updated,
    });

    return updated;
  }

  async remove(id: string, companyId: string, userId: string) {
    const existing = await this.findOne(id, companyId);

    await this.prisma.party.delete({
      where: { id },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'PARTY_DELETE',
      entity: 'Party',
      entityId: id,
      beforeState: existing,
    });

    return { message: 'Party master deleted successfully' };
  }
}
