import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Get all users in organization' })
  async findByOrg(@CurrentUser('organizationId') orgId: string) {
    return this.userService.findByOrg(orgId);
  }

  @Get(':id')
  @Permissions('users.manage')
  @ApiOperation({ summary: 'Get details of a user' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') orgId: string,
  ) {
    return this.userService.findOne(id, orgId);
  }
}
