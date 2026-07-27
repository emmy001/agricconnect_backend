import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CooperativeService } from './cooperative.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('cooperative')
@Controller('cooperative')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CooperativeController {
  constructor(private readonly cooperativeService: CooperativeService) {}

  // Cooperative CRUD
  @Post()
  @ApiOperation({ summary: 'Create cooperative' })
  async create(@CurrentUser() user: User, @Body() data: any) {
    return this.cooperativeService.create(user.id, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cooperatives' })
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.cooperativeService.findAll(page, limit);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get user cooperatives' })
  async findMy(@CurrentUser() user: User) {
    return this.cooperativeService.findMy(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cooperative by ID' })
  async findOne(@Param('id') id: string) {
    return this.cooperativeService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update cooperative' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.cooperativeService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cooperative' })
  async delete(@Param('id') id: string) {
    return this.cooperativeService.delete(id);
  }

  // Members
  @Post(':id/join')
  @ApiOperation({ summary: 'Join cooperative' })
  async join(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cooperativeService.join(user.id, id);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave cooperative' })
  async leave(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cooperativeService.leave(user.id, id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get cooperative members' })
  async getMembers(@Param('id') id: string) {
    return this.cooperativeService.getMembers(id);
  }

  // Services
  @Post(':id/services')
  @ApiOperation({ summary: 'Add service to cooperative' })
  async addService(@Param('id') id: string, @Body() data: any) {
    return this.cooperativeService.addService(id, data);
  }

  @Get(':id/services')
  @ApiOperation({ summary: 'Get cooperative services' })
  async getServices(@Param('id') id: string) {
    return this.cooperativeService.getServices(id);
  }

  // Group Bookings
  @Post(':id/group-booking')
  @ApiOperation({ summary: 'Create group booking' })
  async createGroupBooking(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.cooperativeService.createGroupBooking(user.id, id, data);
  }

  @Get(':id/group-bookings')
  @ApiOperation({ summary: 'Get group bookings' })
  async getGroupBookings(@Param('id') id: string) {
    return this.cooperativeService.getGroupBookings(id);
  }

  // Savings
  @Post(':id/contribute')
  @ApiOperation({ summary: 'Contribute to cooperative savings' })
  async contribute(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.cooperativeService.contribute(user.id, id, amount);
  }

  @Get(':id/savings')
  @ApiOperation({ summary: 'Get cooperative savings' })
  async getSavings(@Param('id') id: string) {
    return this.cooperativeService.getSavings(id);
  }
}