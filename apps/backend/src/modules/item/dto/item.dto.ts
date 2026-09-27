import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'Industrial Brass Valve 1/2"' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'VALVE-BRASS-05' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: '8481.80.20', required: false })
  @IsString()
  @IsOptional()
  hsnSac?: string;

  @ApiProperty({ example: 'Hardware & Fittings', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'PCS', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: 18.00, required: false })
  @IsNumber()
  @IsOptional()
  gstRate?: number;

  @ApiProperty({ example: 450.00, required: false })
  @IsNumber()
  @IsOptional()
  purchasePrice?: number;

  @ApiProperty({ example: 650.00, required: false })
  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @ApiProperty({ example: 750.00, required: false })
  @IsNumber()
  @IsOptional()
  mrp?: number;

  @ApiProperty({ example: 25.00, required: false })
  @IsNumber()
  @IsOptional()
  reorderLevel?: number;

  @ApiProperty({ example: '8901234567890', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateItemDto extends CreateItemDto {}
