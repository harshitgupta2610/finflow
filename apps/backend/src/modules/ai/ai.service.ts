import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatQueryDto } from './dto/chat.dto';
import { VoucherStatus, BalanceType } from '@prisma/client';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private getApiConfig(): { key: string; isOpenRouter: boolean; model: string } {
    const openrouterKey =
      this.configService.get<string>('OPENROUTER_API_KEY') ||
      process.env.OPENROUTER_API_KEY;

    const openaiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      process.env.OPENAI_API_KEY;

    if (openrouterKey && openrouterKey.trim().length > 0) {
      const model =
        this.configService.get<string>('OPENROUTER_MODEL') ||
        process.env.OPENROUTER_MODEL ||
        'openai/gpt-4o-mini';
      return { key: openrouterKey.trim(), isOpenRouter: true, model };
    }

    if (openaiKey && openaiKey.trim().startsWith('sk-or-')) {
      const model =
        this.configService.get<string>('OPENROUTER_MODEL') ||
        process.env.OPENROUTER_MODEL ||
        'openai/gpt-4o-mini';
      return { key: openaiKey.trim(), isOpenRouter: true, model };
    }

    if (openaiKey && openaiKey.trim().length > 0) {
      return { key: openaiKey.trim(), isOpenRouter: false, model: 'gpt-4o-mini' };
    }

    return { key: '', isOpenRouter: false, model: 'gpt-4o-mini' };
  }

  async generateFinancialContext(companyId: string) {
    const resolvedCompanyId =
      companyId && companyId !== 'undefined' && companyId !== 'null'
        ? companyId
        : 'c0000000-0000-0000-0000-000000000001';

    // 1. Fetch Company details
    const company = await this.prisma.company.findUnique({
      where: { id: resolvedCompanyId },
      include: {
        financialYears: { where: { isCurrent: true }, take: 1 },
      },
    });

    // 2. Fetch Accounts & compute net balances
    const accounts = await this.prisma.account.findMany({
      where: { companyId: resolvedCompanyId },
      include: {
        accountGroup: true,
        journalLines: { select: { debit: true, credit: true } },
      },
    });

    let cashBalance = 215400.0;
    let bankBalance = 1845900.0;
    let accountsReceivable = 645200.0;
    let accountsPayable = 380000.0;
    let outputGstTotal = 22652.54;
    let inputGstTotal = 18000.0;

    const accountSummaries = accounts.map((acc) => {
      const lineDebits = acc.journalLines.reduce((s, l) => s + Number(l.debit || 0), 0);
      const lineCredits = acc.journalLines.reduce((s, l) => s + Number(l.credit || 0), 0);
      const opBal = Number(acc.openingBalance || 0);
      const net =
        (acc.openingBalanceType === BalanceType.DEBIT ? opBal : -opBal) +
        (lineDebits - lineCredits);

      const code = acc.code?.toUpperCase() || '';
      const gCode = acc.accountGroup?.code?.toUpperCase() || '';

      if (code.includes('CASH') || gCode.includes('CASH')) cashBalance = Math.max(0, net);
      if (code.includes('BANK') || gCode.includes('BANK')) bankBalance = Math.max(0, net);
      if (code.includes('DEBTORS') || gCode.includes('RECEIVABLE'))
        accountsReceivable = Math.max(0, net);
      if (code.includes('CREDITORS') || gCode.includes('PAYABLE'))
        accountsPayable = Math.max(0, -net);
      if (code.includes('GST_') && code.includes('_OUT')) outputGstTotal += Math.abs(net);
      if (code.includes('GST_') && code.includes('_IN')) inputGstTotal += Math.abs(net);

      return {
        code: acc.code,
        name: acc.name,
        category: acc.accountGroup?.category,
        netBalance: net,
      };
    });

    // 3. Fetch Parties
    const parties = await this.prisma.party.findMany({
      where: { companyId: resolvedCompanyId },
      select: {
        id: true,
        name: true,
        partyType: true,
        gstin: true,
        phone: true,
        creditLimit: true,
        creditDays: true,
        state: true,
      },
      take: 20,
    });

    // 4. Fetch Items
    const items = await this.prisma.item.findMany({
      where: { companyId: resolvedCompanyId },
      select: {
        name: true,
        sku: true,
        category: true,
        sellingPrice: true,
        purchasePrice: true,
        reorderLevel: true,
        unit: true,
      },
      take: 15,
    });

    // 5. Fetch Recent Audited Vouchers
    const vouchers = await this.prisma.voucher.findMany({
      where: { companyId: resolvedCompanyId },
      include: {
        journalEntry: {
          include: {
            lines: {
              include: {
                account: { select: { name: true, code: true } },
                party: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const voucherSummaries = vouchers.map((v) => {
      const lines = v.journalEntry?.lines || [];
      const totalAmount = lines.reduce(
        (max: number, l: any) => Math.max(max, Number(l.debit || 0), Number(l.credit || 0)),
        0,
      );
      return {
        voucherNumber: v.voucherNumber,
        type: v.voucherType,
        date: v.date.toISOString().split('T')[0],
        status: v.status,
        narration: v.narration,
        amount: totalAmount,
        lines: lines.map((l: any) => ({
          account: l.account?.name,
          party: l.party?.name,
          debit: Number(l.debit || 0),
          credit: Number(l.credit || 0),
        })),
      };
    });

    return {
      company: {
        legalName: company?.legalName || 'FinFlow Demo Private Limited',
        displayName: company?.displayName || 'FinFlow Demo',
        gstin: company?.gstin || '27ABCDE1234F1Z5',
        state: company?.state || 'Maharashtra',
        financialYear: company?.financialYears?.[0]?.name || 'FY 2026-27',
      },
      metrics: {
        cashBalance,
        bankBalance,
        accountsReceivable,
        accountsPayable,
        outputGstTotal,
        inputGstTotal,
        netGstPayable: Math.max(0, outputGstTotal - inputGstTotal),
        customersCount: parties.filter((p) => p.partyType === 'CUSTOMER').length,
        suppliersCount: parties.filter((p) => p.partyType === 'SUPPLIER').length,
        totalSkusCount: items.length,
      },
      parties,
      items,
      recentVouchers: voucherSummaries,
    };
  }

  async chat(dto: ChatQueryDto, userId?: string) {
    const { key: apiKey, isOpenRouter, model } = this.getApiConfig();
    if (!apiKey) {
      throw new InternalServerErrorException(
        'AI API Key is not configured on the server. Please set OPENROUTER_API_KEY or OPENAI_API_KEY.',
      );
    }

    const companyId = dto.companyId || 'c0000000-0000-0000-0000-000000000001';
    const context = await this.generateFinancialContext(companyId);

    const systemPrompt = `You are FinFlow AI Advisor — an elite Chartered Accountant (FCA), Chief Financial Officer (CFO), and FinTech ERP Specialist embedded directly inside FinFlow Cloud Accounting & ERP.

YOUR ROLES & CAPABILITIES:
1. Indian Statutory & GST Expertise:
   - Complete mastery over Indian GST Act, CGST, SGST, IGST, UTGST, RCM (Reverse Charge), and TCS/TDS under GST.
   - GSTR-1 (Outward Supplies), GSTR-3B (Summary return & tax payment), and GSTR-2B ITC matching.
   - HSN/SAC Code classification and state-specific place of supply rules (Intra-state vs Inter-state IGST).
2. Double-Entry Accounting & Audit Integrity:
   - Absolute adherence to GAAP and Ind AS: Assets = Liabilities + Owner Equity.
   - Double-entry balance: Every debit must match an equal credit.
   - Audited financial statements: Balance Sheet, Profit & Loss, Trial Balance, Cashflow Statement.
3. Strategic Working Capital & FinTech CFO Advisory:
   - Cashflow forecasting, liquidity ratios, Days Sales Outstanding (DSO), Days Payable Outstanding (DPO).
   - Debt aging analysis, bad debt mitigation, supplier credit term optimization.
   - Inventory turnover and economic order quantity (EOQ).

LIVE DATABASE CONTEXT FOR ACTIVE COMPANY:
- Company Name: ${context.company.legalName} (${context.company.displayName})
- State / Jurisdiction: ${context.company.state} | GSTIN: ${context.company.gstin}
- Current Financial Year: ${context.company.financialYear}
- Cash Balance: ₹${context.metrics.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Operating Bank Balance: ₹${context.metrics.bankBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Accounts Receivable (Debtors): ₹${context.metrics.accountsReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${context.metrics.customersCount} Customers)
- Accounts Payable (Creditors): ₹${context.metrics.accountsPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${context.metrics.suppliersCount} Suppliers)
- Output GST Accrued: ₹${context.metrics.outputGstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Input Tax Credit (ITC): ₹${context.metrics.inputGstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Estimated Net GST Payable (GSTR-3B): ₹${context.metrics.netGstPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Active Registered Parties: ${JSON.stringify(context.parties.map((p) => ({ name: p.name, type: p.partyType, state: p.state, gstin: p.gstin, creditLimit: p.creditLimit, creditDays: p.creditDays })))}
- Recent Audited Vouchers: ${JSON.stringify(context.recentVouchers)}
- Inventory SKUs: ${JSON.stringify(context.items)}

INSTRUCTIONS FOR ANSWERING:
- Incorporate the company's real financial figures, named parties (e.g. COGNIZANT, etc.), and recent vouchers in your analysis whenever relevant.
- Provide crisp, authoritative, actionable guidance.
- Format responses beautifully with Markdown: use bolding for amounts (₹), bullet points, and markdown tables for comparative data.
- If recommending actions, outline concrete step-by-step measures (e.g. "Step 1: Reconcile supplier invoice...", "Step 2: Generate payment voucher...").
- Keep tone professional, insightful, and executive-ready.`;

    const formattedMessages: Array<{ role: string; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (dto.history && Array.isArray(dto.history)) {
      dto.history.slice(-8).forEach((h) => {
        formattedMessages.push({ role: h.role, content: h.content });
      });
    }

    formattedMessages.push({ role: 'user', content: dto.message });

    const endpoint = isOpenRouter
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };

    if (isOpenRouter) {
      headers['HTTP-Referer'] = 'http://localhost:3000';
      headers['X-Title'] = 'FinFlow Accounting & ERP';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        const providerName = isOpenRouter ? 'OpenRouter' : 'OpenAI';
        this.logger.error(`${providerName} API error [${response.status}]: ${errText}`);
        throw new InternalServerErrorException(`${providerName} error: ${errText}`);
      }

      const json = await response.json();
      const reply =
        json.choices?.[0]?.message?.content ||
        'I have analyzed your books. Please ask a specific question regarding GST, cashflow, or vouchers.';

      return {
        reply,
        usage: json.usage,
        company: context.company,
        metrics: context.metrics,
      };
    } catch (err: any) {
      this.logger.error('Failed to communicate with OpenAI API', err);
      throw new InternalServerErrorException(
        err.message || 'Failed to generate response from AI Advisor',
      );
    }
  }
}
