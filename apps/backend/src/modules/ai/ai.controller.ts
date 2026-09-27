import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { ChatQueryDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('AI Business Advisor & FinTech Agent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI Financial Advisor powered by OpenAI & Live ERP Context' })
  async chat(
    @CurrentUser('id') userId: string,
    @CurrentUser('company') userCompany: any,
    @Body() dto: ChatQueryDto,
  ) {
    if (!dto.companyId && userCompany?.id) {
      dto.companyId = userCompany.id;
    }
    return this.aiService.chat(dto, userId);
  }

  @Get('context')
  @ApiOperation({ summary: 'Get current real-time financial context snapshot' })
  async getContext(
    @Query('companyId') companyId?: string,
    @CurrentUser('company') userCompany?: any,
  ) {
    const activeCompId = companyId || userCompany?.id || 'c0000000-0000-0000-0000-000000000001';
    return this.aiService.generateFinancialContext(activeCompId);
  }
}
