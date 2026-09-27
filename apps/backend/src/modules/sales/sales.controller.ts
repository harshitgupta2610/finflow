import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSalesInvoiceDto } from './dto/sales-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sales Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/invoices')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new GST Sales Invoice' })
  async createSalesInvoice(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSalesInvoiceDto,
  ) {
    return this.salesService.createSalesInvoice(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales invoices for company' })
  async findAllInvoices(@Query('companyId') companyId: string) {
    return this.salesService.findAllInvoices(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales invoice details by ID' })
  async findInvoiceById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.salesService.findInvoiceById(id, companyId);
  }
}
