import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from './entities/farm.entity';
import { FarmBoundary } from './entities/farm-boundary.entity';
import { Animal, AnimalHealthStatus } from './entities/animal.entity';
import { Crop, CropStage } from './entities/crop.entity';
import { HealthRecord } from './entities/health-record.entity';
import { Vaccination } from './entities/vaccination.entity';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { CreateCropDto } from './dto/create-crop.dto';
import { UpdateCropDto } from './dto/update-crop.dto';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    @InjectRepository(FarmBoundary)
    private boundaryRepository: Repository<FarmBoundary>,
    @InjectRepository(Animal)
    private animalRepository: Repository<Animal>,
    @InjectRepository(Crop)
    private cropRepository: Repository<Crop>,
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
    @InjectRepository(Vaccination)
    private vaccinationRepository: Repository<Vaccination>,
  ) {}

  // Farm Operations
  async createFarm(userId: string, createFarmDto: CreateFarmDto): Promise<Farm> {
    const farm = this.farmRepository.create({
      farmerId: userId,
      ...createFarmDto,
    });
    return this.farmRepository.save(farm);
  }

  async getFarms(userId: string): Promise<Farm[]> {
    return this.farmRepository.find({
      where: { farmerId: userId },
      relations: ['boundary', 'animals', 'crops'],
    });
  }

  async getFarm(id: string): Promise<Farm> {
    const farm = await this.farmRepository.findOne({
      where: { id },
      relations: ['boundary', 'animals', 'crops'],
    });
    if (!farm) {
      throw new NotFoundException('Farm not found');
    }
    return farm;
  }

  async updateFarm(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.getFarm(id);
    Object.assign(farm, updateFarmDto);
    return this.farmRepository.save(farm);
  }

  async deleteFarm(id: string): Promise<{ success: boolean }> {
    await this.getFarm(id);
    await this.farmRepository.softDelete(id);
    return { success: true };
  }

  // Boundary Operations
  async addBoundary(farmId: string, points: any[]): Promise<FarmBoundary> {
    const farm = await this.getFarm(farmId);
    
    // Calculate area (simplified)
    const area = this.calculateArea(points);
    
    const boundary = this.boundaryRepository.create({
      farmId,
      points,
      area,
    });
    
    const saved = await this.boundaryRepository.save(boundary);
    farm.boundary = saved;
    await this.farmRepository.save(farm);
    
    return saved;
  }

  async getBoundary(farmId: string): Promise<FarmBoundary> {
    const boundary = await this.boundaryRepository.findOne({
      where: { farmId },
    });
    if (!boundary) {
      throw new NotFoundException('Boundary not found');
    }
    return boundary;
  }

  private calculateArea(points: any[]): number {
    // Shoelace formula for area calculation
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i].latitude * points[j].longitude;
      area -= points[j].latitude * points[i].longitude;
    }
    return Math.abs(area) / 2;
  }

  // Animal Operations
  async addAnimal(farmId: string, createAnimalDto: CreateAnimalDto): Promise<Animal> {
    await this.getFarm(farmId);
    const animal = this.animalRepository.create({
      farmId,
      ...createAnimalDto,
    });
    return this.animalRepository.save(animal);
  }

  async getAnimals(farmId: string): Promise<Animal[]> {
    await this.getFarm(farmId);
    return this.animalRepository.find({
      where: { farmId },
      relations: ['healthRecords', 'vaccinations'],
    });
  }

  async getAnimal(id: string): Promise<Animal> {
    const animal = await this.animalRepository.findOne({
      where: { id },
      relations: ['healthRecords', 'vaccinations'],
    });
    if (!animal) {
      throw new NotFoundException('Animal not found');
    }
    return animal;
  }

  async updateAnimal(id: string, updateAnimalDto: UpdateAnimalDto): Promise<Animal> {
    const animal = await this.getAnimal(id);
    Object.assign(animal, updateAnimalDto);
    return this.animalRepository.save(animal);
  }

  async deleteAnimal(id: string): Promise<{ success: boolean }> {
    await this.getAnimal(id);
    await this.animalRepository.softDelete(id);
    return { success: true };
  }

  // Crop Operations
  async addCrop(farmId: string, createCropDto: CreateCropDto): Promise<Crop> {
    await this.getFarm(farmId);
    const crop = this.cropRepository.create({
      farmId,
      ...createCropDto,
    });
    return this.cropRepository.save(crop);
  }

  async getCrops(farmId: string): Promise<Crop[]> {
    await this.getFarm(farmId);
    return this.cropRepository.find({
      where: { farmId },
    });
  }

  async getCrop(id: string): Promise<Crop> {
    const crop = await this.cropRepository.findOne({
      where: { id },
    });
    if (!crop) {
      throw new NotFoundException('Crop not found');
    }
    return crop;
  }

  async updateCrop(id: string, updateCropDto: UpdateCropDto): Promise<Crop> {
    const crop = await this.getCrop(id);
    Object.assign(crop, updateCropDto);
    return this.cropRepository.save(crop);
  }

  async deleteCrop(id: string): Promise<{ success: boolean }> {
    await this.getCrop(id);
    await this.cropRepository.softDelete(id);
    return { success: true };
  }

  // Health Record Operations
  async addHealthRecord(animalId: string, createHealthRecordDto: CreateHealthRecordDto): Promise<HealthRecord> {
    await this.getAnimal(animalId);
    const record = this.healthRecordRepository.create({
      animalId,
      ...createHealthRecordDto,
    });
    return this.healthRecordRepository.save(record);
  }

  async getHealthRecords(animalId: string): Promise<HealthRecord[]> {
    await this.getAnimal(animalId);
    return this.healthRecordRepository.find({
      where: { animalId },
      order: { date: 'DESC' },
    });
  }

  // Vaccination Operations
  async addVaccination(animalId: string, createVaccinationDto: CreateVaccinationDto): Promise<Vaccination> {
    await this.getAnimal(animalId);
    const vaccination = this.vaccinationRepository.create({
      animalId,
      ...createVaccinationDto,
    });
    return this.vaccinationRepository.save(vaccination);
  }

  async getVaccinations(animalId: string): Promise<Vaccination[]> {
    await this.getAnimal(animalId);
    return this.vaccinationRepository.find({
      where: { animalId },
      order: { dueDate: 'ASC' },
    });
  }

  // Analytics
  async getFarmAnalytics(farmId: string): Promise<any> {
    const farm = await this.getFarm(farmId);
    const animals = await this.animalRepository.find({ where: { farmId } });
    const crops = await this.cropRepository.find({ where: { farmId } });

    // Calculate health score
    const healthyAnimals = animals.filter(a => a.healthStatus === AnimalHealthStatus.GOOD);
    const healthScore = animals.length > 0 ? (healthyAnimals.length / animals.length) * 100 : 100;

    // Calculate total yield
    const totalYield = crops.reduce((sum, c) => sum + (c.actualYield || c.yieldEstimate || 0), 0);

    // Calculate production data for chart
    const productionData = crops.map(c => ({
      monthIndex: new Date(c.plantingDate).getMonth(),
      value: c.actualYield || c.yieldEstimate || 0,
    }));

    return {
      totalAnimals: animals.length,
      totalCrops: crops.length,
      healthScore: Math.round(healthScore),
      yield: totalYield,
      maxProduction: Math.max(...productionData.map(d => d.value), 100),
      productionData,
    };
  }
}