import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountCategory, BalanceType } from '@prisma/client';

export class CreateAccountGroupDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'Current Assets' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'CURR_ASSETS' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: AccountCategory, example: AccountCategory.ASSET })
  @IsEnum(AccountCategory)
  @IsNotEmpty()
  category: AccountCategory;

  @ApiProperty({ example: 'parent-group-id', required: false })
  @IsString()
  @IsOptional()
  parentId?: string;
}

export class CreateAccountDto {
  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001' })
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({ example: 'group-id-uuid' })
  @IsString()
  @IsNotEmpty()
  accountGroupId: string;

  @ApiProperty({ example: 'HDFC Bank Primary A/c' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'BANK_HDFC_01' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 150000.00, required: false })
  @IsNumber()
  @IsOptional()
  openingBalance?: number;

  @ApiProperty({ enum: BalanceType, example: BalanceType.DEBIT, required: false })
  @IsEnum(BalanceType)
  @IsOptional()
  openingBalanceType?: BalanceType;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateAccountDto extends CreateAccountDto {}
