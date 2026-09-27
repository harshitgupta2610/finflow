import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get recent system audit logs' })
  async getAuditLogs(
    @CurrentUser('organizationId') organizationId: string,
    @Query('companyId') companyId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findAll(organizationId, companyId, limit ? Number(limit) : 50);
  }
}
