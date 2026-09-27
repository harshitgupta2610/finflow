import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePurchaseInvoiceDto } from './dto/purchase-invoice.dto';
import { VoucherType, VoucherStatus, PaymentMode, InvoiceStatus, Prisma } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async createPurchaseInvoice(userId: string, dto: CreatePurchaseInvoiceDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException('Company record not found');
    }

    const supplier = await this.prisma.party.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('Supplier record not found');
    }

    const companyState = (company.state || 'Maharashtra').trim().toLowerCase();
    const supplyState = (dto.placeOfSupply || supplier.state || companyState).trim().toLowerCase();
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

    const purchaseInvoice = await this.prisma.$transaction(async (tx) => {
      // 1. Create Voucher Header
      const voucher = await tx.voucher.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherType: VoucherType.PURCHASE,
          voucherNumber: dto.invoiceNumber,
          date: new Date(dto.invoiceDate),
          narration: dto.notes || `Purchase Invoice from ${supplier.name}`,
          status: VoucherStatus.APPROVED,
          createdById: userId,
          approvedById: userId,
        },
      });

      // 2. Create Purchase Invoice Header
      const invoice = await tx.purchaseInvoice.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherId: voucher.id,
          invoiceNumber: dto.invoiceNumber,
          invoiceDate: new Date(dto.invoiceDate),
          dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          supplierId: dto.supplierId,
          placeOfSupply: dto.placeOfSupply || supplier.state,
          isTaxInclusive: dto.isTaxInclusive ?? false,
          paymentMode: dto.paymentMode || PaymentMode.CREDIT,
          status: dto.paymentMode === PaymentMode.CREDIT ? InvoiceStatus.UNPAID : InvoiceStatus.PAID,
          subtotal: new Prisma.Decimal(subtotal),
          discountTotal: new Prisma.Decimal(discountTotal),
          inputCgst: new Prisma.Decimal(cgstTotal),
          inputSgst: new Prisma.Decimal(sgstTotal),
          inputIgst: new Prisma.Decimal(igstTotal),
          freightCharges: new Prisma.Decimal(freight),
          roundOff: new Prisma.Decimal(roundOff),
          totalAmount: new Prisma.Decimal(roundedTotal),
          notes: dto.notes,
        },
      });

      // 3. Create Purchase Invoice Lines
      for (const pl of processedLines) {
        await tx.purchaseInvoiceLine.create({
          data: {
            purchaseInvoiceId: invoice.id,
            itemId: pl.itemId,
            quantity: new Prisma.Decimal(pl.quantity),
            unitPrice: new Prisma.Decimal(pl.unitPrice),
            discount: new Prisma.Decimal(pl.discount),
            gstRate: new Prisma.Decimal(pl.gstRate),
            taxableAmount: new Prisma.Decimal(pl.taxableAmount),
            inputCgst: new Prisma.Decimal(pl.cgst),
            inputSgst: new Prisma.Decimal(pl.sgst),
            inputIgst: new Prisma.Decimal(pl.igst),
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
          narration: `Purchase Invoice ${dto.invoiceNumber}`,
        },
      });

      const purchaseAccount = await tx.account.findFirst({
        where: { companyId: dto.companyId, code: 'PURCHASE_GEN' },
      });
      const creditorsAccount = await tx.account.findFirst({
        where: { companyId: dto.companyId, accountGroup: { code: 'PAYABLES' } },
      });

      if (purchaseAccount) {
        // Purchase Expense Dr Subtotal
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: je.id,
            accountId: purchaseAccount.id,
            debit: new Prisma.Decimal(subtotal),
            credit: new Prisma.Decimal(0),
          },
        });
      }

      if (creditorsAccount) {
        // Supplier Cr Total Amount
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: je.id,
            accountId: creditorsAccount.id,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(roundedTotal),
            partyId: supplier.id,
          },
        });
      }

      return invoice;
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'PURCHASE_INVOICE_CREATE',
      entity: 'PurchaseInvoice',
      entityId: purchaseInvoice.id,
      afterState: purchaseInvoice,
    });

    return purchaseInvoice;
  }

  async findAllInvoices(companyId: string) {
    return this.prisma.purchaseInvoice.findMany({
      where: { companyId },
      include: {
        supplier: true,
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
    const invoice = await this.prisma.purchaseInvoice.findFirst({
      where: { id, companyId },
      include: {
        supplier: true,
        company: true,
        lines: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Purchase invoice record not found');
    }
    return invoice;
  }
}
