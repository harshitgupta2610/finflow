import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';

export class CreatePurchaseInvoiceLineDto {
  @ApiProperty({ description: 'Item Master SKU ID' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ description: 'Quantity purchased', example: 10 })
  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @ApiProperty({ description: 'Unit purchase price', example: 450.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Line item discount amount', example: 0 })
  @IsOptional()
  @IsNumber()
  discount?: number;

  @ApiPropertyOptional({ description: 'GST rate percentage', example: 18 })
  @IsOptional()
  @IsNumber()
  gstRate?: number;
}

export class CreatePurchaseInvoiceDto {
  @ApiProperty({ description: 'Company ID' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ description: 'Financial Year ID' })
  @IsString()
  @IsNotEmpty()
  financialYearId: string;

  @ApiProperty({ description: 'Supplier Vendor Invoice Number', example: 'INV-2026-0089' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({ description: 'Invoice Date (YYYY-MM-DD)', example: '2026-09-27' })
  @IsString()
  @IsNotEmpty()
  invoiceDate: string;

  @ApiPropertyOptional({ description: 'Payment Due Date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ description: 'Supplier/Vendor Party ID' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiPropertyOptional({ description: 'Place of Supply / State Code', example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  placeOfSupply?: string;

  @ApiPropertyOptional({ description: 'Tax Inclusive Price Flag', default: false })
  @IsOptional()
  @IsBoolean()
  isTaxInclusive?: boolean;

  @ApiPropertyOptional({ description: 'Payment Mode', enum: PaymentMode, default: PaymentMode.CREDIT })
  @IsOptional()
  @IsString()
  paymentMode?: PaymentMode;

  @ApiPropertyOptional({ description: 'Freight / Transportation charges', example: 0 })
  @IsOptional()
  @IsNumber()
  freightCharges?: number;

  @ApiPropertyOptional({ description: 'Notes or internal comments' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Purchase line items', type: [CreatePurchaseInvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseInvoiceLineDto)
  lines: CreatePurchaseInvoiceLineDto[];
}
