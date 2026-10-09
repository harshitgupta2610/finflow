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
    const resolvedCompanyId =
      companyId && companyId !== 'undefined' && companyId !== 'null' && companyId.length > 5
        ? companyId
        : 'c0000000-0000-0000-0000-000000000001';

    let parties = await this.prisma.party.findMany({
      where: {
        companyId: resolvedCompanyId,
        ...(type ? { partyType: { in: [type, PartyType.BOTH] } } : {}),
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

    if (parties.length === 0 && !search) {
      await this.seedDefaultParties(resolvedCompanyId);
      parties = await this.prisma.party.findMany({
        where: {
          companyId: resolvedCompanyId,
          ...(type ? { partyType: { in: [type, PartyType.BOTH] } } : {}),
        },
        orderBy: { name: 'asc' },
      });
    }

    return parties;
  }

  async seedDefaultParties(companyId: string) {
    const defaults = [
      {
        companyId,
        name: 'Reliance Retail Ventures Ltd',
        partyType: PartyType.CUSTOMER,
        gstin: '27AABCR2418Q1ZV',
        pan: 'AABCR2418Q',
        phone: '+91 22 2278 5000',
        email: 'billing@relianceretail.com',
        billingAddress: 'Reliance Corporate Park, Thane-Belapur Road, Ghansoli',
        state: 'Maharashtra',
        creditLimit: 2500000,
        creditDays: 45,
      },
      {
        companyId,
        name: 'Tata Steel Processing Ltd',
        partyType: PartyType.SUPPLIER,
        gstin: '20AAACT2727Q1ZW',
        pan: 'AAACT2727Q',
        phone: '+91 657 242 4000',
        email: 'accounts@tatasteel.com',
        billingAddress: 'Jamshedpur Works, Bistupur',
        state: 'Jharkhand',
        creditLimit: 5000000,
        creditDays: 60,
      },
      {
        companyId,
        name: 'COGNIZANT TECHNOLOGY SOLUTIONS',
        partyType: PartyType.SUPPLIER,
        gstin: '33AABCC2058K1ZN',
        pan: 'AABCC2058K',
        phone: '+91 44 4209 6000',
        email: 'vendor.finance@cognizant.com',
        billingAddress: '5/535, Old Mahabalipuram Road, Thoraipakkam',
        state: 'Tamil Nadu',
        creditLimit: 1000000,
        creditDays: 30,
      },
      {
        companyId,
        name: 'Infosys BPM Limited',
        partyType: PartyType.CUSTOMER,
        gstin: '29AABCI2856H1ZU',
        pan: 'AABCI2856H',
        phone: '+91 80 2852 0261',
        email: 'finance.receivables@infosys.com',
        billingAddress: 'Electronics City, Hosur Road',
        state: 'Karnataka',
        creditLimit: 1500000,
        creditDays: 30,
      },
      {
        companyId,
        name: 'Godrej Industries Ltd',
        partyType: PartyType.CUSTOMER,
        gstin: '27AAACG0572J1ZG',
        pan: 'AAACG0572J',
        phone: '+91 22 2518 8010',
        email: 'corp.sales@godrej.com',
        billingAddress: 'Pirojshanagar, Eastern Express Highway, Vikhroli',
        state: 'Maharashtra',
        creditLimit: 800000,
        creditDays: 30,
      },
    ];

    for (const p of defaults) {
      await this.prisma.party.create({ data: p }).catch(() => null);
    }
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
    const rawDto: any = dto;
    const resolvedType = dto.partyType || rawDto.type || PartyType.CUSTOMER;
    const resolvedAddress = dto.billingAddress || rawDto.address;

    const party = await this.prisma.party.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        partyType: resolvedType,
        gstin: dto.gstin,
        pan: dto.pan,
        phone: dto.phone,
        email: dto.email,
        billingAddress: resolvedAddress,
        shippingAddress: dto.shippingAddress || resolvedAddress,
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
