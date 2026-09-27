import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartyType } from '@prisma/client';

export class CreatePartyDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'Apex Trading Co' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PartyType, example: PartyType.CUSTOMER })
  @IsEnum(PartyType)
  @IsNotEmpty()
  partyType: PartyType;

  @ApiProperty({ example: '27ABCDE1234F1Z5', required: false })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsString()
  @IsOptional()
  pan?: string;

  @ApiProperty({ example: '+91 98765 43210', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'accounts@apextrading.com', required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Plot 42, Industrial Area Phase 2, Pune', required: false })
  @IsString()
  @IsOptional()
  billingAddress?: string;

  @ApiProperty({ example: 'Plot 42, Industrial Area Phase 2, Pune', required: false })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '411018', required: false })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiProperty({ example: 500000.00, required: false })
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @ApiProperty({ example: 30, required: false })
  @IsNumber()
  @IsOptional()
  creditDays?: number;

  @ApiProperty({ example: 25000.00, required: false })
  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @ApiProperty({ example: 'Wholesale customer with 30-day payment term', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePartyDto extends CreatePartyDto {}
