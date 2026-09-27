import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountGroupDto, CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AccountCategory } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Chart of Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('seed-defaults')
  @ApiOperation({ summary: 'Seed default Indian business Chart of Accounts for company' })
  async seedDefaults(@Body('companyId') companyId: string) {
    return this.accountService.seedDefaultChartOfAccounts(companyId);
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get hierarchical tree of account groups & ledgers' })
  async getAccountGroupTree(@Query('companyId') companyId: string) {
    return this.accountService.getAccountGroupTree(companyId);
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create new account group' })
  async createAccountGroup(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccountGroupDto,
  ) {
    return this.accountService.createAccountGroup(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all ledger accounts' })
  async getAccounts(
    @Query('companyId') companyId: string,
    @Query('category') category?: AccountCategory,
  ) {
    return this.accountService.getAccounts(companyId, category);
  }

  @Post()
  @ApiOperation({ summary: 'Create new ledger account' })
  async createAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.accountService.createAccount(userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update ledger account' })
  async updateAccount(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountService.updateAccount(id, companyId, userId, dto);
  }
}
