import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMode } from '@prisma/client';

export class SalesInvoiceLineDto {
  @ApiProperty({ example: 'item-uuid' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ example: 650.00 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiProperty({ example: 18.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  gstRate?: number;
}

export class CreateSalesInvoiceDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'fy-2024-25' })
  @IsString()
  @IsNotEmpty()
  financialYearId: string;

  @ApiProperty({ example: 'INV-2026-001' })
  @IsString()
  @IsNotEmpty()
  invoiceNumber: string;

  @ApiProperty({ example: '2026-09-27' })
  @IsString()
  @IsNotEmpty()
  invoiceDate: string;

  @ApiProperty({ example: '2026-10-27', required: false })
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ example: 'customer-party-uuid' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsString()
  @IsOptional()
  placeOfSupply?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isTaxInclusive?: boolean;

  @ApiProperty({ enum: PaymentMode, example: PaymentMode.CREDIT })
  @IsEnum(PaymentMode)
  @IsOptional()
  paymentMode?: PaymentMode;

  @ApiProperty({ example: 500.00, required: false })
  @IsNumber()
  @IsOptional()
  freightCharges?: number;

  @ApiProperty({ example: 'Dispatch via V-Trans Ltd.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [SalesInvoiceLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesInvoiceLineDto)
  lines: SalesInvoiceLineDto[];
}
