import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateSalesInvoiceDto } from './dto/sales-invoice.dto';
import { VoucherType, VoucherStatus, PaymentMode, InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createSalesInvoice(userId: string, dto: CreateSalesInvoiceDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException('Company record not found');
    }

    const customer = await this.prisma.party.findUnique({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new NotFoundException('Customer record not found');
    }

    // Determine Intra-state vs Inter-state GST (e.g. MH -> MH = CGST+SGST, MH -> GJ = IGST)
    const companyState = (company.state || 'Maharashtra').trim().toLowerCase();
    const supplyState = (dto.placeOfSupply || customer.state || companyState).trim().toLowerCase();
    const isIntraState = companyState === supplyState;

    let subtotal = 0;
    let discountTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;

    const processedLines = [];

    for (const line of dto.lines) {
      const item = await this.prisma.item.findUnique({ where: { id: line.itemId } });
      if (!item) {
        throw new NotFoundException(`Item master ID '${line.itemId}' not found`);
      }

      const qty = line.quantity;
      const rate = line.unitPrice;
      const disc = line.discount || 0;
      const gstRate = line.gstRate ?? Number(item.gstRate);

      let grossAmount = qty * rate - disc;
      let taxable = grossAmount;
      let cgst = 0;
      let sgst = 0;
      let igst = 0;

      if (dto.isTaxInclusive) {
        taxable = grossAmount / (1 + gstRate / 100);
      }

      const taxAmount = (taxable * gstRate) / 100;

      if (isIntraState) {
        cgst = taxAmount / 2;
        sgst = taxAmount / 2;
        cgstTotal += cgst;
        sgstTotal += sgst;
      } else {
        igst = taxAmount;
        igstTotal += igst;
      }

      const lineTotal = taxable + taxAmount;
      subtotal += taxable;
      discountTotal += disc;

      processedLines.push({
        itemId: line.itemId,
        quantity: qty,
        unitPrice: rate,
        discount: disc,
        gstRate,
        taxableAmount: taxable,
        cgst,
        sgst,
        igst,
        total: lineTotal,
      });
    }

    const freight = dto.freightCharges || 0;
    const rawTotal = subtotal + cgstTotal + sgstTotal + igstTotal + freight;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = roundedTotal - rawTotal;

    // Transactionally create SalesInvoice + Voucher + Journal Entry
    const salesInvoice = await this.prisma.$transaction(async (tx) => {
      // 1. Create Voucher Header
      const voucher = await tx.voucher.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherType: VoucherType.SALES,
          voucherNumber: dto.invoiceNumber,
          date: new Date(dto.invoiceDate),
          narration: dto.notes || `Sales Invoice to ${customer.name}`,
          status: VoucherStatus.APPROVED,
          createdById: userId,
          approvedById: userId,
        },
      });

      // 2. Create Sales Invoice Header
      const invoice = await tx.salesInvoice.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherId: voucher.id,
          invoiceNumber: dto.invoiceNumber,
          invoiceDate: new Date(dto.invoiceDate),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          customerId: dto.customerId,
          placeOfSupply: dto.placeOfSupply || customer.state,
          isTaxInclusive: dto.isTaxInclusive ?? false,
          paymentMode: dto.paymentMode || PaymentMode.CREDIT,
          status: dto.paymentMode === PaymentMode.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID,
          subtotal: new Prisma.Decimal(subtotal),
          discountTotal: new Prisma.Decimal(discountTotal),
          cgstTotal: new Prisma.Decimal(cgstTotal),
          sgstTotal: new Prisma.Decimal(sgstTotal),
          igstTotal: new Prisma.Decimal(igstTotal),
          freightCharges: new Prisma.Decimal(freight),
          roundOff: new Prisma.Decimal(roundOff),
          totalAmount: new Prisma.Decimal(roundedTotal),
          notes: dto.notes,
        },
      });

      // 3. Create Sales Lines
      for (const pl of processedLines) {
        await tx.salesInvoiceLine.create({
          data: {
            salesInvoiceId: invoice.id,
            itemId: pl.itemId,
            quantity: new Prisma.Decimal(pl.quantity),
            unitPrice: new Prisma.Decimal(pl.unitPrice),
            discount: new Prisma.Decimal(pl.discount),
            gstRate: new Prisma.Decimal(pl.gstRate),
            taxableAmount: new Prisma.Decimal(pl.taxableAmount),
            cgst: new Prisma.Decimal(pl.cgst),
            sgst: new Prisma.Decimal(pl.sgst),
            igst: new Prisma.Decimal(pl.igst),
            total: new Prisma.Decimal(pl.total),
          },
        });
      }

      // 4. Automatic Double-Entry Journal Entry
      const je = await tx.journalEntry.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherId: voucher.id,
          date: new Date(dto.invoiceDate),
          narration: `Sales Invoice ${dto.invoiceNumber}`,
        },
      });

      // Find Sales Account & Debtors Account
      const salesAccount = await tx.account.findFirst({
        where: { companyId: dto.companyId, code: 'SALES_GEN' },
      });
      const debtorsAccount = await tx.account.findFirst({
        where: { companyId: dto.companyId, accountGroup: { code: 'RECEIVABLES' } },
      });

      if (debtorsAccount) {
        // Customer Dr Total Amount
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: je.id,
            accountId: debtorsAccount.id,
            debit: new Prisma.Decimal(roundedTotal),
            credit: new Prisma.Decimal(0),
            partyId: customer.id,
          },
        });
      }

      if (salesAccount) {
        // Sales Revenue Cr Taxable Subtotal
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: je.id,
            accountId: salesAccount.id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(subtotal),
          },
        });
      }

      return invoice;
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'SALES_INVOICE_CREATE',
      entity: 'SalesInvoice',
      entityId: salesInvoice.id,
      afterState: salesInvoice,
    });

    return salesInvoice;
  }

  async findAllInvoices(companyId: string) {
    return this.prisma.salesInvoice.findMany({
      where: { companyId },
      include: {
        customer: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  async findInvoiceById(id: string, companyId: string) {
    const invoice = await this.prisma.salesInvoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        company: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Sales invoice record not found');
    }
    return invoice;
  }
}
