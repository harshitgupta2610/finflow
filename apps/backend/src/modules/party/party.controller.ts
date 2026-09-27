import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { CreatePartyDto, UpdatePartyDto } from './dto/party.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { PartyType } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Party Master')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('parties')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Get()
  @Permissions('party.read')
  @ApiOperation({ summary: 'Get all customers/suppliers for company' })
  async findAllByCompany(
    @Query('companyId') companyId: string,
    @Query('type') type?: PartyType,
    @Query('search') search?: string,
  ) {
    return this.partyService.findAllByCompany(companyId, type, search);
  }

  @Get(':id')
  @Permissions('party.read')
  @ApiOperation({ summary: 'Get party master record details & transaction summary' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.partyService.findOne(id, companyId);
  }

  @Post()
  @Permissions('party.create')
  @ApiOperation({ summary: 'Create new customer or supplier' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePartyDto,
  ) {
    return this.partyService.create(userId, dto);
  }

  @Put(':id')
  @Permissions('party.update')
  @ApiOperation({ summary: 'Update party details' })
  async update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePartyDto,
  ) {
    return this.partyService.update(id, companyId, userId, dto);
  }

  @Delete(':id')
  @Permissions('party.delete')
  @ApiOperation({ summary: 'Delete party record' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.partyService.remove(id, companyId, userId);
  }
}
