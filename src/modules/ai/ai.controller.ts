import { Controller, Post, Get, Body, Param, UseGuards, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AIService } from './ai.service';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { PredictYieldDto } from './dto/predict-yield.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('ai')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('analyze')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Analyze image for disease detection' })
  async analyzeImage(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Body() analyzeImageDto: AnalyzeImageDto,
  ) {
    return this.aiService.analyzeImage(user.id, file, analyzeImageDto);
  }

  @Post('predict-yield')
  @ApiOperation({ summary: 'Predict crop yield' })
  async predictYield(@CurrentUser() user: User, @Body() predictYieldDto: PredictYieldDto) {
    return this.aiService.predictYield(user.id, predictYieldDto);
  }

  @Get('weather')
  @ApiOperation({ summary: 'Get weather forecast' })
  async getWeather(
    @CurrentUser() user: User,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.aiService.getWeather(user.id, lat, lng);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@CurrentUser() user: User, @Body() chatMessageDto: ChatMessageDto) {
    return this.aiService.chat(user.id, chatMessageDto);
  }

  @Get('disease-alerts')
  @ApiOperation({ summary: 'Get disease alerts' })
  async getDiseaseAlerts(
    @CurrentUser() user: User,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.aiService.getDiseaseAlerts(user.id, lat, lng);
  }

  @Get('diagnoses')
  @ApiOperation({ summary: 'Get user diagnoses history' })
  async getDiagnoses(@CurrentUser() user: User) {
    return this.aiService.getDiagnoses(user.id);
  }

  @Get('diagnoses/:id')
  @ApiOperation({ summary: 'Get diagnosis by ID' })
  async getDiagnosis(@Param('id') id: string) {
    return this.aiService.getDiagnosis(id);
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get user predictions history' })
  async getPredictions(@CurrentUser() user: User) {
    return this.aiService.getPredictions(user.id);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations' })
  async getRecommendations(
    @CurrentUser() user: User,
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('category') category?: string,
  ) {
    return this.aiService.getRecommendations(user.id, lat, lng, category);
  }
}