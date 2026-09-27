import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Item Master')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  @Permissions('item.read')
  @ApiOperation({ summary: 'Get all item SKU records for company' })
  async findAllByCompany(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.itemService.findAllByCompany(companyId, category, search);
  }

  @Get(':id')
  @Permissions('item.read')
  @ApiOperation({ summary: 'Get details of an item SKU' })
  async findOne(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
  ) {
    return this.itemService.findOne(id, companyId);
  }

  @Post()
  @Permissions('item.create')
  @ApiOperation({ summary: 'Create new item SKU master record' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateItemDto,
  ) {
    return this.itemService.create(userId, dto);
  }

  @Put(':id')
  @Permissions('item.update')
  @ApiOperation({ summary: 'Update item SKU details' })
  async update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemService.update(id, companyId, userId, dto);
  }

  @Delete(':id')
  @Permissions('item.update')
  @ApiOperation({ summary: 'Delete item master record' })
  async remove(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.itemService.remove(id, companyId, userId);
  }
}
