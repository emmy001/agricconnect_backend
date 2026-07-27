import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('farms')
@Controller('farms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  // Farm CRUD
  @Post()
  @ApiOperation({ summary: 'Create farm' })
  async createFarm(@CurrentUser() user: User, @Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.createFarm(user.id, createFarmDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user farms' })
  async getFarms(@CurrentUser() user: User) {
    return this.farmsService.getFarms(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get farm by ID' })
  async getFarm(@Param('id') id: string) {
    return this.farmsService.getFarm(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update farm' })
  async updateFarm(@Param('id') id: string, @Body() updateFarmDto: UpdateFarmDto) {
    return this.farmsService.updateFarm(id, updateFarmDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete farm' })
  async deleteFarm(@Param('id') id: string) {
    return this.farmsService.deleteFarm(id);
  }

  // Farm Boundary
  @Post(':id/boundary')
  @ApiOperation({ summary: 'Add farm boundary' })
  async addBoundary(@Param('id') id: string, @Body('points') points: any[]) {
    return this.farmsService.addBoundary(id, points);
  }

  @Get(':id/boundary')
  @ApiOperation({ summary: 'Get farm boundary' })
  async getBoundary(@Param('id') id: string) {
    return this.farmsService.getBoundary(id);
  }

  // Animals
  @Post(':id/animals')
  @ApiOperation({ summary: 'Add animal' })
  async addAnimal(@Param('id') id: string, @Body() createAnimalDto: CreateAnimalDto) {
    return this.farmsService.addAnimal(id, createAnimalDto);
  }

  @Get(':id/animals')
  @ApiOperation({ summary: 'Get farm animals' })
  async getAnimals(@Param('id') id: string) {
    return this.farmsService.getAnimals(id);
  }

  @Get('animals/:animalId')
  @ApiOperation({ summary: 'Get animal by ID' })
  async getAnimal(@Param('animalId') animalId: string) {
    return this.farmsService.getAnimal(animalId);
  }

  @Put('animals/:animalId')
  @ApiOperation({ summary: 'Update animal' })
  async updateAnimal(@Param('animalId') animalId: string, @Body() updateAnimalDto: UpdateAnimalDto) {
    return this.farmsService.updateAnimal(animalId, updateAnimalDto);
  }

  @Delete('animals/:animalId')
  @ApiOperation({ summary: 'Delete animal' })
  async deleteAnimal(@Param('animalId') animalId: string) {
    return this.farmsService.deleteAnimal(animalId);
  }

  // Crops
  @Post(':id/crops')
  @ApiOperation({ summary: 'Add crop' })
  async addCrop(@Param('id') id: string, @Body() createCropDto: CreateCropDto) {
    return this.farmsService.addCrop(id, createCropDto);
  }

  @Get(':id/crops')
  @ApiOperation({ summary: 'Get farm crops' })
  async getCrops(@Param('id') id: string) {
    return this.farmsService.getCrops(id);
  }

  @Get('crops/:cropId')
  @ApiOperation({ summary: 'Get crop by ID' })
  async getCrop(@Param('cropId') cropId: string) {
    return this.farmsService.getCrop(cropId);
  }

  @Put('crops/:cropId')
  @ApiOperation({ summary: 'Update crop' })
  async updateCrop(@Param('cropId') cropId: string, @Body() updateCropDto: UpdateCropDto) {
    return this.farmsService.updateCrop(cropId, updateCropDto);
  }

  @Delete('crops/:cropId')
  @ApiOperation({ summary: 'Delete crop' })
  async deleteCrop(@Param('cropId') cropId: string) {
    return this.farmsService.deleteCrop(cropId);
  }

  // Health Records
  @Post('animals/:animalId/health-records')
  @ApiOperation({ summary: 'Add health record' })
  async addHealthRecord(@Param('animalId') animalId: string, @Body() createHealthRecordDto: CreateHealthRecordDto) {
    return this.farmsService.addHealthRecord(animalId, createHealthRecordDto);
  }

  @Get('animals/:animalId/health-records')
  @ApiOperation({ summary: 'Get health records' })
  async getHealthRecords(@Param('animalId') animalId: string) {
    return this.farmsService.getHealthRecords(animalId);
  }

  // Vaccinations
  @Post('animals/:animalId/vaccinations')
  @ApiOperation({ summary: 'Add vaccination' })
  async addVaccination(@Param('animalId') animalId: string, @Body() createVaccinationDto: CreateVaccinationDto) {
    return this.farmsService.addVaccination(animalId, createVaccinationDto);
  }

  @Get('animals/:animalId/vaccinations')
  @ApiOperation({ summary: 'Get vaccinations' })
  async getVaccinations(@Param('animalId') animalId: string) {
    return this.farmsService.getVaccinations(animalId);
  }

  // Analytics
  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get farm analytics' })
  async getFarmAnalytics(@Param('id') id: string) {
    return this.farmsService.getFarmAnalytics(id);
  }
}