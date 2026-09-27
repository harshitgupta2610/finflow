import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VoucherType, VoucherStatus } from '@prisma/client';

export class JournalEntryLineDto {
  @ApiProperty({ example: 'account-uuid' })
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ example: 5000.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  debit?: number;

  @ApiProperty({ example: 0.00, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  credit?: number;

  @ApiProperty({ example: 'party-uuid', required: false })
  @IsString()
  @IsOptional()
  partyId?: string;

  @ApiProperty({ example: 'branch-uuid', required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}

export class CreateVoucherDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'fy-uuid' })
  @IsString()
  @IsNotEmpty()
  financialYearId: string;

  @ApiProperty({ enum: VoucherType, example: VoucherType.JOURNAL })
  @IsEnum(VoucherType)
  @IsNotEmpty()
  voucherType: VoucherType;

  @ApiProperty({ example: 'VOUCH-2026-001' })
  @IsString()
  @IsNotEmpty()
  voucherNumber: string;

  @ApiProperty({ example: '2026-09-27' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Payment received from customer for Invoice INV-1002', required: false })
  @IsString()
  @IsOptional()
  narration?: string;

  @ApiProperty({ type: [JournalEntryLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];
}
