import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateVoucherDto } from './dto/voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VoucherType, VoucherStatus } from '@prisma/client';

@ApiTags('Accounting & Vouchers Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('vouchers')
  @ApiOperation({ summary: 'Get all audited vouchers for company' })
  async findAllVouchers(
    @Query('companyId') companyId?: string,
    @CurrentUser('company') userCompany?: any,
    @Query('type') type?: VoucherType,
    @Query('status') status?: VoucherStatus,
    @Query('limit') limit?: string,
  ) {
    const activeCompId = companyId || userCompany?.id || 'c0000000-0000-0000-0000-000000000001';
    return this.accountingService.findAllVouchers(activeCompId, type, status, limit ? parseInt(limit, 10) : 50);
  }

  @Get('reports/dashboard')
  @ApiOperation({ summary: 'Get live real-time dashboard financial metrics' })
  async getDashboardSummary(
    @Query('companyId') companyId?: string,
    @CurrentUser('company') userCompany?: any,
  ) {
    const activeCompId = companyId || userCompany?.id || 'c0000000-0000-0000-0000-000000000001';
    return this.accountingService.getDashboardSummary(activeCompId);
  }

  @Post('vouchers')
  @ApiOperation({ summary: 'Create & post a balanced double-entry voucher' })
  async createVoucher(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.accountingService.createVoucher(userId, dto);
  }

  @Post('vouchers/:id/cancel')
  @ApiOperation({ summary: 'Cancel an approved voucher and post reversal journal entry' })
  async cancelVoucher(
    @Param('id') voucherId: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.accountingService.cancelVoucher(voucherId, companyId, userId, reason);
  }

  @Get('reports/ledger')
  @ApiOperation({ summary: 'Get account ledger statement with running balance' })
  async getLedger(
    @Query('companyId') companyId: string,
    @Query('accountId') accountId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getLedger(companyId, accountId, startDate, endDate);
  }

  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Get Trial Balance report as of date' })
  async getTrialBalance(
    @Query('companyId') companyId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.accountingService.getTrialBalance(companyId, asOfDate);
  }

  @Get('reports/profit-loss')
  @ApiOperation({ summary: 'Get Profit & Loss Statement (Income vs Expenses)' })
  async getProfitLoss(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.accountingService.getProfitLoss(companyId, startDate, endDate);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Get Balance Sheet (Assets vs Liabilities & Equity)' })
  async getBalanceSheet(
    @Query('companyId') companyId: string,
    @Query('asOfDate') asOfDate?: string,
  ) {
    return this.accountingService.getBalanceSheet(companyId, asOfDate);
  }

  @Get('reports/daybook')
  @ApiOperation({ summary: 'Get Daybook — all journal entry transactions for a date range' })
  async getDaybook(
    @Query('companyId') companyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('voucherType') voucherType?: VoucherType,
  ) {
    return this.accountingService.getDaybook(companyId, startDate, endDate, voucherType);
  }
}
