import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: 'user' | 'assistant' | 'system';

  @ApiProperty({ example: 'What is our current cashflow and GST liability?' })
  @IsString()
  content: string;
}

export class ChatQueryDto {
  @ApiProperty({ example: 'Give me an executive summary of our working capital and GST dues' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'c0000000-0000-0000-0000-000000000001', required: false })
  @IsString()
  @IsOptional()
  companyId?: string;

  @ApiProperty({ type: [ChatMessageDto], required: false })
  @IsArray()
  @IsOptional()
  history?: ChatMessageDto[];
}
