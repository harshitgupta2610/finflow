import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateAccountGroupDto, CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { AccountCategory, BalanceType } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async seedDefaultChartOfAccounts(companyId: string) {
    const defaultGroups = [
      { name: 'Assets', code: 'ASSETS', category: AccountCategory.ASSET },
      { name: 'Liabilities', code: 'LIABILITIES', category: AccountCategory.LIABILITY },
      { name: 'Equity', code: 'EQUITY', category: AccountCategory.EQUITY },
      { name: 'Income', code: 'INCOME', category: AccountCategory.INCOME },
      { name: 'Expenses', code: 'EXPENSES', category: AccountCategory.EXPENSE },
    ];

    for (const group of defaultGroups) {
      await this.prisma.accountGroup.upsert({
        where: {
          companyId_code: { companyId, code: group.code },
        },
        update: {},
        create: {
          companyId,
          name: group.name,
          code: group.code,
          category: group.category,
        },
      });
    }

    // Root Parents
    const assetsParent = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'ASSETS' } },
    });
    const liabParent = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'LIABILITIES' } },
    });
    const incomeParent = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'INCOME' } },
    });
    const expenseParent = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'EXPENSES' } },
    });

    const subGroups = [
      { name: 'Cash-in-Hand', code: 'CASH', category: AccountCategory.ASSET, parentId: assetsParent?.id },
      { name: 'Bank Accounts', code: 'BANK', category: AccountCategory.ASSET, parentId: assetsParent?.id },
      { name: 'Accounts Receivable (Debtors)', code: 'RECEIVABLES', category: AccountCategory.ASSET, parentId: assetsParent?.id },
      { name: 'Stock / Inventory', code: 'INVENTORY', category: AccountCategory.ASSET, parentId: assetsParent?.id },
      { name: 'Accounts Payable (Creditors)', code: 'PAYABLES', category: AccountCategory.LIABILITY, parentId: liabParent?.id },
      { name: 'GST Output Payable', code: 'GST_OUTPUT', category: AccountCategory.LIABILITY, parentId: liabParent?.id },
      { name: 'GST Input Tax Credit', code: 'GST_INPUT', category: AccountCategory.ASSET, parentId: assetsParent?.id },
      { name: 'Sales Accounts', code: 'SALES_REV', category: AccountCategory.INCOME, parentId: incomeParent?.id },
      { name: 'Purchase Accounts', code: 'PURCHASE_EXP', category: AccountCategory.EXPENSE, parentId: expenseParent?.id },
      { name: 'Indirect Expenses', code: 'INDIRECT_EXP', category: AccountCategory.EXPENSE, parentId: expenseParent?.id },
    ];

    for (const sub of subGroups) {
      await this.prisma.accountGroup.upsert({
        where: {
          companyId_code: { companyId, code: sub.code },
        },
        update: {},
        create: {
          companyId,
          name: sub.name,
          code: sub.code,
          category: sub.category,
          parentId: sub.parentId,
        },
      });
    }

    // Default Ledgers
    const cashGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'CASH' } },
    });
    const bankGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'BANK' } },
    });
    const salesGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'SALES_REV' } },
    });
    const purchaseGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'PURCHASE_EXP' } },
    });
    const debtorsGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'RECEIVABLES' } },
    });
    const creditorsGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'PAYABLES' } },
    });
    const equityGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'EQUITY' } },
    });
    const gstOutputGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'GST_OUTPUT' } },
    });
    const gstInputGroup = await this.prisma.accountGroup.findUnique({
      where: { companyId_code: { companyId, code: 'GST_INPUT' } },
    });

    const defaultLedgers = [
      {
        groupId: cashGroup?.id,
        name: 'Main Cash-in-Hand',
        code: 'CASH_PRIMARY',
        openingBalance: 215400.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: bankGroup?.id,
        name: 'HDFC Bank Operating Account',
        code: 'BANK_HDFC',
        openingBalance: 1845900.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: debtorsGroup?.id,
        name: 'Sundry Debtors (General)',
        code: 'DEBTORS_GEN',
        openingBalance: 645200.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: creditorsGroup?.id,
        name: 'Sundry Creditors (General)',
        code: 'CREDITORS_GEN',
        openingBalance: 380000.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: equityGroup?.id,
        name: "Owner's Capital & Equity",
        code: 'CAPITAL_GEN',
        openingBalance: 2326500.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: salesGroup?.id,
        name: 'Sales Revenue (Domestic GST)',
        code: 'SALES_GEN',
        openingBalance: 0.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: purchaseGroup?.id,
        name: 'Purchase Account (Raw Materials/Goods)',
        code: 'PURCHASE_GEN',
        openingBalance: 0.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: gstOutputGroup?.id,
        name: 'Output CGST Payable',
        code: 'GST_CGST_OUT',
        openingBalance: 0.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: gstOutputGroup?.id,
        name: 'Output SGST Payable',
        code: 'GST_SGST_OUT',
        openingBalance: 0.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: gstOutputGroup?.id,
        name: 'Output IGST Payable',
        code: 'GST_IGST_OUT',
        openingBalance: 0.00,
        type: BalanceType.CREDIT,
      },
      {
        groupId: gstInputGroup?.id,
        name: 'Input CGST Tax Credit',
        code: 'GST_CGST_IN',
        openingBalance: 0.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: gstInputGroup?.id,
        name: 'Input SGST Tax Credit',
        code: 'GST_SGST_IN',
        openingBalance: 0.00,
        type: BalanceType.DEBIT,
      },
      {
        groupId: gstInputGroup?.id,
        name: 'Input IGST Tax Credit',
        code: 'GST_IGST_IN',
        openingBalance: 0.00,
        type: BalanceType.DEBIT,
      },
    ];

    for (const l of defaultLedgers) {
      if (l.groupId) {
        await this.prisma.account.upsert({
          where: { companyId_code: { companyId, code: l.code } },
          update: {},
          create: {
            companyId,
            accountGroupId: l.groupId,
            name: l.name,
            code: l.code,
            openingBalance: l.openingBalance,
            openingBalanceType: l.type,
          },
        });
      }
    }

    return { message: 'Default Chart of Accounts seeded successfully' };
  }

  async getAccountGroupTree(companyId: string) {
    const groups = await this.prisma.accountGroup.findMany({
      where: { companyId },
      include: {
        accounts: true,
        children: {
          include: {
            accounts: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
    return groups;
  }

  async createAccountGroup(userId: string, dto: CreateAccountGroupDto) {
    const existing = await this.prisma.accountGroup.findUnique({
      where: {
        companyId_code: { companyId: dto.companyId, code: dto.code },
      },
    });

    if (existing) {
      throw new BadRequestException(`Group code '${dto.code}' already exists`);
    }

    const group = await this.prisma.accountGroup.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        code: dto.code,
        category: dto.category,
        parentId: dto.parentId,
      },
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'ACCOUNT_GROUP_CREATE',
      entity: 'AccountGroup',
      entityId: group.id,
      afterState: group,
    });

    return group;
  }

  async getAccounts(companyId: string, category?: AccountCategory) {
    let accounts = await this.prisma.account.findMany({
      where: {
        companyId,
        ...(category ? { accountGroup: { category } } : {}),
      },
      include: {
        accountGroup: true,
      },
      orderBy: { code: 'asc' },
    });

    if (accounts.length === 0) {
      await this.seedDefaultChartOfAccounts(companyId);
      accounts = await this.prisma.account.findMany({
        where: {
          companyId,
          ...(category ? { accountGroup: { category } } : {}),
        },
        include: {
          accountGroup: true,
        },
        orderBy: { code: 'asc' },
      });
    }

    return accounts;
  }

  async createAccount(userId: string, dto: CreateAccountDto) {
    const existing = await this.prisma.account.findUnique({
      where: {
        companyId_code: { companyId: dto.companyId, code: dto.code },
      },
    });

    if (existing) {
      throw new BadRequestException(`Account ledger code '${dto.code}' already exists`);
    }

    const account = await this.prisma.account.create({
      data: {
        companyId: dto.companyId,
        accountGroupId: dto.accountGroupId,
        name: dto.name,
        code: dto.code,
        openingBalance: dto.openingBalance ?? 0.00,
        openingBalanceType: dto.openingBalanceType ?? BalanceType.DEBIT,
        isActive: dto.isActive ?? true,
      },
      include: {
        accountGroup: true,
      },
    });

    await this.auditService.log({
      companyId: dto.companyId,
      userId,
      action: 'ACCOUNT_CREATE',
      entity: 'Account',
      entityId: account.id,
      afterState: account,
    });

    return account;
  }

  async updateAccount(id: string, companyId: string, userId: string, dto: UpdateAccountDto) {
    const existing = await this.prisma.account.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Account ledger not found');
    }

    const updated = await this.prisma.account.update({
      where: { id },
      data: {
        name: dto.name,
        accountGroupId: dto.accountGroupId,
        openingBalance: dto.openingBalance,
        openingBalanceType: dto.openingBalanceType,
        isActive: dto.isActive,
      },
      include: {
        accountGroup: true,
      },
    });

    await this.auditService.log({
      companyId,
      userId,
      action: 'ACCOUNT_UPDATE',
      entity: 'Account',
      entityId: id,
      beforeState: existing,
      afterState: updated,
    });

    return updated;
  }
}
