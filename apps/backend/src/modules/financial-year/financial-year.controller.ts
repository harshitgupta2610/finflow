import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FinancialYearService } from './financial-year.service';
import { CreateFinancialYearDto } from './dto/financial-year.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Financial Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('financial-years')
export class FinancialYearController {
  constructor(private readonly fyService: FinancialYearService) {}

  @Get()
  @ApiOperation({ summary: 'Get all financial years for a company' })
  async findByCompany(@Query('companyId') companyId: string) {
    return this.fyService.findByCompany(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new financial year' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFinancialYearDto,
  ) {
    return this.fyService.create(userId, dto);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Set a financial year as active' })
  async setAsCurrent(
    @Param('id') id: string,
    @Body('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.fyService.setAsCurrent(id, companyId, userId);
  }
}
