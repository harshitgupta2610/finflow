import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({ example: 'FinFlow Retail Pvt Ltd' })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({ example: 'FinFlow Retail' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ example: 'ABCDE1234F', required: false })
  @IsString()
  @IsOptional()
  pan?: string;

  @ApiProperty({ example: '27ABCDE1234F1Z5', required: false })
  @IsString()
  @IsOptional()
  gstin?: string;

  @ApiProperty({ example: '123 Commercial Street, Mumbai', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: '400001', required: false })
  @IsString()
  @IsOptional()
  pincode?: string;

  @ApiProperty({ example: 'info@finflowretail.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+91 98765 00000', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateCompanyDto extends CreateCompanyDto {}
