import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Permissions('company.read')
  @ApiOperation({ summary: 'Get all companies in user organization' })
  async findAll(@CurrentUser('organizationId') orgId: string) {
    return this.companyService.findAllByOrg(orgId);
  }

  @Get(':id')
  @Permissions('company.read')
  @ApiOperation({ summary: 'Get details of a specific company' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.companyService.findOne(id, orgId);
  }

  @Post()
  @Permissions('company.update')
  @ApiOperation({ summary: 'Create a new company' })
  async create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companyService.create(orgId, userId, dto);
  }

  @Put(':id')
  @Permissions('company.update')
  @ApiOperation({ summary: 'Update company details' })
  async update(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.update(id, orgId, userId, dto);
  }
}
