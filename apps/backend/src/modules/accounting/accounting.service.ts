import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateVoucherDto, JournalEntryLineDto } from './dto/voucher.dto';
import { VoucherType, VoucherStatus, AccountCategory, BalanceType } from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountingService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  /**
   * Validates strict double-entry balance: SUM(debit) === SUM(credit)
   */
  validateJournalEntry(lines: JournalEntryLineDto[]) {
    if (!lines || lines.length < 2) {
      throw new BadRequestException('A journal entry must contain at least 2 lines (at least 1 debit and 1 credit)');
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;
    }

    // Floating-point diff tolerance for Decimal rounding (0.0001)
    const difference = Math.abs(totalDebit - totalCredit);
    if (difference > 0.0001) {
      throw new BadRequestException(
        `Double-entry balance validation failed: Total Debits (₹${totalDebit.toFixed(2)}) does not equal Total Credits (₹${totalCredit.toFixed(2)}). Difference: ₹${difference.toFixed(2)}`,
      );
    }

    return { totalDebit, totalCredit };
  }

  /**
   * Transactionally posts a balanced Voucher & JournalEntry
   */
  async createVoucher(userId: string, dto: CreateVoucherDto) {
    // 1. Enforce strict double-entry rule
    const { totalDebit, totalCredit } = this.validateJournalEntry(dto.lines);

    // 2. Execute within PostgreSQL Transaction
    const voucher = await this.prisma.$transaction(async (tx) => {
      // Create Voucher Header
      const v = await tx.voucher.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherType: dto.voucherType,
          voucherNumber: dto.voucherNumber,
          date: new Date(dto.date),
          narration: dto.narration,
          status: VoucherStatus.APPROVED,
          createdById: userId,
          approvedById: userId,
        },
      });

      // Create Journal Entry Header
      const je = await tx.journalEntry.create({
        data: {
          companyId: dto.companyId,
          financialYearId: dto.financialYearId,
          voucherId: v.id,
          date: new Date(dto.date),
          narration: dto.narration,
        },
      });

      // Create Journal Entry Lines
      for (const line of dto.lines) {
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: je.id,
            accountId: line.accountId,
            debit: new Prisma.Decimal(line.debit || 0),
            credit: new Prisma.Decimal(line.credit || 0),
            partyId: line.partyId,
            branchId: line.branchId,
          },
        });
      }

      return v;
    });

    // 3. Audit Log
    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'VOUCHER_CREATE',
      entity: 'Voucher',
      entityId: voucher.id,
      afterState: { voucherId: voucher.id, totalDebit, totalCredit },
    });

    return voucher;
  }

  /**
   * Cancels an approved voucher by creating a Reversal Journal Entry
   */
  async cancelVoucher(voucherId: string, companyId: string, userId: string, reason?: string) {
    const voucher = await this.prisma.voucher.findFirst({
      where: { id: voucherId, companyId },
      include: {
        journalEntry: {
          include: {
            lines: true,
          },
        },
      },
    });

    if (!voucher || !voucher.journalEntry) {
      throw new NotFoundException('Voucher not found');
    }

    if (voucher.status === VoucherStatus.CANCELLED) {
      throw new BadRequestException('Voucher is already cancelled');
    }

    const reversalVoucher = await this.prisma.$transaction(async (tx) => {
      // 1. Mark original voucher as CANCELLED
      await tx.voucher.update({
        where: { id: voucherId },
        data: { status: VoucherStatus.CANCELLED },
      });

      // 2. Create Reversal Voucher Header
      const revVoucher = await tx.voucher.create({
        data: {
          companyId: voucher.companyId,
          financialYearId: voucher.financialYearId,
          voucherType: voucher.voucherType,
          voucherNumber: `${voucher.voucherNumber}-REV`,
          date: new Date(),
          narration: `Reversal of Voucher ${voucher.voucherNumber}. Reason: ${reason || 'Cancelled by user'}`,
          status: VoucherStatus.APPROVED,
          createdById: userId,
          approvedById: userId,
        },
      });

      // 3. Create Reversal Journal Entry Header
      const revJE = await tx.journalEntry.create({
        data: {
          companyId: voucher.companyId,
          financialYearId: voucher.financialYearId,
          voucherId: revVoucher.id,
          date: new Date(),
          narration: `Reversal of Voucher ${voucher.voucherNumber}`,
          isReversal: true,
          reversalOfId: voucher.journalEntry.id,
        },
      });

      // 4. Create Reversal Lines (Swap Debit <-> Credit)
      for (const line of voucher.journalEntry.lines) {
        await tx.journalEntryLine.create({
          data: {
            journalEntryId: revJE.id,
            accountId: line.accountId,
            debit: line.credit, // SWAP
            credit: line.debit, // SWAP
            partyId: line.partyId,
            branchId: line.branchId,
          },
        });
      }

      return revVoucher;
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'VOUCHER_CANCEL',
      entity: 'Voucher',
      entityId: voucherId,
      afterState: { reversalVoucherId: reversalVoucher.id, reason },
    });

    return { message: 'Voucher cancelled and reversal entry posted successfully', reversalVoucher };
  }

  /**
   * Computes Account Ledger statement with running debit/credit balance
   */
  async getLedger(companyId: string, accountId: string, startDate?: string, endDate?: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, companyId },
      include: { accountGroup: true },
    });
    if (!account) {
      throw new NotFoundException('Account ledger not found');
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where: {
        accountId,
        journalEntry: {
          companyId,
          ...(startDate || endDate
            ? {
                date: {
                  ...(startDate ? { gte: new Date(startDate) } : {}),
                  ...(endDate ? { lte: new Date(endDate) } : {}),
                },
              }
            : {}),
        },
      },
      include: {
        journalEntry: {
          include: {
            voucher: true,
          },
        },
        party: true,
      },
      orderBy: { journalEntry: { date: 'asc' } },
    });

    let runningBalance = Number(account.openingBalance);
    const statement = lines.map((l) => {
      const debit = Number(l.debit);
      const credit = Number(l.credit);
      if (account.openingBalanceType === BalanceType.DEBIT) {
        runningBalance += debit - credit;
      } else {
        runningBalance += credit - debit;
      }

      return {
        id: l.id,
        date: l.journalEntry.date,
        voucherType: l.journalEntry.voucher.voucherType,
        voucherNumber: l.journalEntry.voucher.voucherNumber,
        narration: l.journalEntry.narration,
        partyName: l.party?.name || null,
        debit,
        credit,
        runningBalance,
      };
    });

    return {
      account: {
        id: account.id,
        name: account.name,
        code: account.code,
        group: account.accountGroup.name,
        category: account.accountGroup.category,
        openingBalance: Number(account.openingBalance),
        openingBalanceType: account.openingBalanceType,
      },
      closingBalance: runningBalance,
      statement,
    };
  }

  /**
   * Computes Trial Balance as of a specified date
   */
  async getTrialBalance(companyId: string, asOfDate?: string) {
    const accounts = await this.prisma.account.findMany({
      where: { companyId },
      include: { accountGroup: true },
      orderBy: { code: 'asc' },
    });

    const trialBalanceRows = [];
    let grandTotalDebit = 0;
    let grandTotalCredit = 0;

    for (const acc of accounts) {
      const lineSum = await this.prisma.journalEntryLine.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: {
            companyId,
            ...(asOfDate ? { date: { lte: new Date(asOfDate) } } : {}),
          },
        },
        _sum: {
          debit: true,
          credit: true,
        },
      });

      const openingBal = Number(acc.openingBalance);
      const totalDebit = Number(lineSum._sum.debit || 0);
      const totalCredit = Number(lineSum._sum.credit || 0);

      let netDebit = 0;
      let netCredit = 0;

      if (acc.openingBalanceType === BalanceType.DEBIT) {
        const net = openingBal + totalDebit - totalCredit;
        if (net >= 0) netDebit = net;
        else netCredit = Math.abs(net);
      } else {
        const net = openingBal + totalCredit - totalDebit;
        if (net >= 0) netCredit = net;
        else netDebit = Math.abs(net);
      }

      grandTotalDebit += netDebit;
      grandTotalCredit += netCredit;

      trialBalanceRows.push({
        accountId: acc.id,
        code: acc.code,
        name: acc.name,
        group: acc.accountGroup.name,
        category: acc.accountGroup.category,
        debit: netDebit,
        credit: netCredit,
      });
    }

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      grandTotalDebit,
      grandTotalCredit,
      isBalanced: Math.abs(grandTotalDebit - grandTotalCredit) < 0.001,
      rows: trialBalanceRows,
    };
  }

  /**
   * Computes Profit & Loss Statement (Income vs Expenses)
   */
  async getProfitLoss(companyId: string, startDate?: string, endDate?: string) {
    const incomeAccounts = await this.prisma.account.findMany({
      where: { companyId, accountGroup: { category: AccountCategory.INCOME } },
      include: { accountGroup: true },
    });

    const expenseAccounts = await this.prisma.account.findMany({
      where: { companyId, accountGroup: { category: AccountCategory.EXPENSE } },
      include: { accountGroup: true },
    });

    let totalIncome = 0;
    const incomeList = [];
    for (const acc of incomeAccounts) {
      const lineSum = await this.prisma.journalEntryLine.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: {
            companyId,
            ...(startDate || endDate
              ? {
                  date: {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                  },
                }
              : {}),
          },
        },
        _sum: { debit: true, credit: true },
      });

      const amount = Number(lineSum._sum.credit || 0) - Number(lineSum._sum.debit || 0) + Number(acc.openingBalance);
      totalIncome += amount;
      incomeList.push({ name: acc.name, code: acc.code, amount });
    }

    let totalExpense = 0;
    const expenseList = [];
    for (const acc of expenseAccounts) {
      const lineSum = await this.prisma.journalEntryLine.aggregate({
        where: {
          accountId: acc.id,
          journalEntry: {
            companyId,
            ...(startDate || endDate
              ? {
                  date: {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                  },
                }
              : {}),
          },
        },
        _sum: { debit: true, credit: true },
      });

      const amount = Number(lineSum._sum.debit || 0) - Number(lineSum._sum.credit || 0) + Number(acc.openingBalance);
      totalExpense += amount;
      expenseList.push({ name: acc.name, code: acc.code, amount });
    }

    const netProfit = totalIncome - totalExpense;

    return {
      period: { startDate, endDate },
      totalIncome,
      totalExpense,
      netProfit,
      incomeList,
      expenseList,
    };
  }

  /**
   * Computes Balance Sheet (Assets vs Liabilities & Equity)
   */
  async getBalanceSheet(companyId: string, asOfDate?: string) {
    const tb = await this.getTrialBalance(companyId, asOfDate);

    const assets = tb.rows.filter((r) => r.category === AccountCategory.ASSET);
    const liabilities = tb.rows.filter((r) => r.category === AccountCategory.LIABILITY);
    const equity = tb.rows.filter((r) => r.category === AccountCategory.EQUITY);

    const totalAssets = assets.reduce((sum, r) => sum + r.debit, 0);
    const totalLiabilities = liabilities.reduce((sum, r) => sum + r.credit, 0);
    const totalEquity = equity.reduce((sum, r) => sum + r.credit, 0);

    const pl = await this.getProfitLoss(companyId, undefined, asOfDate);

    return {
      asOfDate: asOfDate || new Date().toISOString(),
      totalAssets,
      totalLiabilities,
      totalEquity,
      retainedEarnings: pl.netProfit,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity + pl.netProfit,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity + pl.netProfit)) < 0.01,
      assets,
      liabilities,
      equity,
    };
  }

  async findAllVouchers(companyId: string, type?: VoucherType, status?: VoucherStatus, limit = 50) {
    return this.prisma.voucher.findMany({
      where: {
        companyId,
        ...(type ? { voucherType: type } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        journalEntry: {
          include: {
            lines: {
              include: {
                account: true,
                party: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }
}
