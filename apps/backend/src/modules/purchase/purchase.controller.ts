import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseInvoiceDto } from './dto/purchase-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Purchase Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchases/invoices')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new GST Purchase Invoice' })
  async createPurchaseInvoice(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseInvoiceDto,
  ) {
    return this.purchaseService.createPurchaseInvoice(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase invoices for company' })
  async findAllInvoices(@Query('companyId') companyId: string) {
    return this.purchaseService.findAllInvoices(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase invoice details by ID' })
  async findInvoiceById(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.purchaseService.findInvoiceById(id, companyId);
  }
}
