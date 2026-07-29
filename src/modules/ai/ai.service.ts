import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cloudinary from 'cloudinary';
import { Diagnosis, DiagnosisSeverity } from './entities/diagnosis.entity';
import { Prediction } from './entities/prediction.entity';
import { WeatherForecast } from './entities/weather-forecast.entity';
import { AnalyzeImageDto } from './dto/analyze-image.dto';
import { PredictYieldDto } from './dto/predict-yield.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AIService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(Prediction)
    private predictionRepository: Repository<Prediction>,
    @InjectRepository(WeatherForecast)
    private weatherRepository: Repository<WeatherForecast>,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    // Configure Cloudinary
    cloudinary.v2.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  async analyzeImage(userId: string, file: Express.Multer.File, analyzeImageDto: AnalyzeImageDto): Promise<Diagnosis> {
    // Upload image to Cloudinary
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'agriconnect/diagnoses',
      public_id: `diagnosis_${Date.now()}`,
    });

    // Simulate AI analysis
    //  Todo: In production, this would use TensorFlow or an external AI service
    const diseases = [
      'Maize Leaf Rust',
      'Fall Armyworm',
      'Maize Lethal Necrosis',
      'Cercospora Leaf Spot',
      'Northern Corn Leaf Blight',
    ];
    
    const randomDisease = diseases[Math.floor(Math.random() * diseases.length)];
    const confidence = 0.7 + Math.random() * 0.25;
    const severity = this.getSeverity(confidence);

    const diagnosis = this.diagnosisRepository.create({
      userId,
      diseaseName: randomDisease,
      description: `Analysis detected ${randomDisease} with ${Math.round(confidence * 100)}% confidence. ${this.getDescription(randomDisease)}`,
      confidence,
      severity,
      imageUrl: result.secure_url,
      recommendedActions: this.getRecommendedActions(randomDisease),
      preventionTips: this.getPreventionTips(randomDisease),
      recommendedProfessionalId: 'professional-1', // Would find actual professional
      metadata: {
        imageAnalysis: {
          width: result.width,
          height: result.height,
          format: result.format,
        },
        analysisType: analyzeImageDto.type || 'plant',
        additionalInfo: analyzeImageDto.additionalInfo,
      },
    });

    return this.diagnosisRepository.save(diagnosis);
  }

  async predictYield(userId: string, predictYieldDto: PredictYieldDto): Promise<Prediction> {
    // Simulate yield prediction
    // Todo: In production, this would use ML models
    const baseYield = 3000 + Math.random() * 4000;
    const areaFactor = predictYieldDto.area / 10;
    const confidence = 0.7 + Math.random() * 0.2;
    
    const predictedYield = baseYield * areaFactor;
    const seasons = ['Rainy', 'Dry', 'Long Rains', 'Short Rains'];
    const bestSeason = seasons[Math.floor(Math.random() * seasons.length)];

    // Generate monthly predictions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyPredictions = months.map((month, index) => ({
      month,
      yield: (predictedYield / 6) * (0.8 + Math.random() * 0.4),
      temperature: 20 + Math.random() * 10,
      rainfall: 50 + Math.random() * 150,
    }));

    const prediction = this.predictionRepository.create({
      userId,
      cropType: predictYieldDto.cropType,
      predictedYield,
      confidence,
      bestSeason,
      factors: {
        area: predictYieldDto.area,
        soilType: predictYieldDto.soilType,
        rainfall: predictYieldDto.rainfall,
        temperature: predictYieldDto.temperature,
      },
      monthlyPredictions,
    });

    return this.predictionRepository.save(prediction);
  }

  async getWeather(userId: string, lat: number, lng: number): Promise<WeatherForecast> {
    // Todo: In production, would call weather API
    // For now, generate mock data
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Stormy'];
    const weather = this.weatherRepository.create({
      userId,
      location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      windSpeed: 5 + Math.random() * 25,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      daily: [
        { day: 'Mon', minTemp: 18, maxTemp: 28, precipitation: 0, condition: 'Sunny' },
        { day: 'Tue', minTemp: 19, maxTemp: 29, precipitation: 5, condition: 'Partly Cloudy' },
        { day: 'Wed', minTemp: 17, maxTemp: 26, precipitation: 15, condition: 'Cloudy' },
        { day: 'Thu', minTemp: 16, maxTemp: 24, precipitation: 20, condition: 'Rainy' },
        { day: 'Fri', minTemp: 18, maxTemp: 27, precipitation: 10, condition: 'Partly Cloudy' },
        { day: 'Sat', minTemp: 20, maxTemp: 30, precipitation: 0, condition: 'Sunny' },
        { day: 'Sun', minTemp: 19, maxTemp: 28, precipitation: 0, condition: 'Sunny' },
      ],
      recommendations: [
        'Irrigate crops early morning',
        'Apply fertilizer before rain',
        'Monitor for pest activity',
        'Harvest dry crops before expected rain',
      ],
    });

    return this.weatherRepository.save(weather);
  }

  async chat(userId: string, chatMessageDto: ChatMessageDto): Promise<{ response: string }> {
    // Todo: In production, would use OpenAI or similar
    const responses = [
      'Based on the symptoms you described, it could be a fungal infection. I recommend consulting a crop doctor.',
      'For best results, plant maize during the rainy season with proper spacing of 75cm between rows.',
      'Fall armyworm can be controlled using recommended pesticides and early detection. Monitor your crops daily.',
      'Soil testing is recommended every 2-3 years. This helps determine the right fertilizer application.',
      'Proper irrigation scheduling can improve crop yield by up to 40%. Consider drip irrigation systems.',
    ];

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
    };
  }

  async getDiseaseAlerts(userId: string, lat: number, lng: number): Promise<any[]> {
    // In production, would fetch from disease database or API
    const alerts = [
      {
        id: '1',
        title: 'Fall Armyworm Outbreak',
        description: 'Fall armyworm reported in the area. Monitor crops regularly.',
        severity: 'high',
        affectedCrops: 'Maize, Sorghum, Millet',
        affectedAnimals: '',
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        detectedAt: new Date(),
        status: 'active',
        symptoms: ['Leaf damage', 'Frass on leaves', 'Larvae visible'],
        preventionTips: ['Regular scouting', 'Early spraying', 'Use resistant varieties'],
        treatmentOptions: ['Recommended pesticides', 'Biological control', 'Traps'],
      },
    ];
    return alerts;
  }

  async getDiagnoses(userId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      where: { userId },
      order: { detectedAt: 'DESC' },
    });
  }

  async getDiagnosis(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({ where: { id } });
    if (!diagnosis) {
      throw new NotFoundException('Diagnosis not found');
    }
    return diagnosis;
  }

  async getPredictions(userId: string): Promise<Prediction[]> {
    return this.predictionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRecommendations(
    userId: string,
    lat: number,
    lng: number,
    category?: string,
  ): Promise<any[]> {
    // In production, would use AI recommendations engine
    return [
      {
        type: 'professional',
        title: 'Dr. James Mwangi - Veterinarian',
        description: 'Top-rated veterinarian with 12 years experience',
        rating: 4.8,
        distance: 2.5,
      },
      {
        type: 'service',
        title: 'Livestock Vaccination Campaign',
        description: '30% discount on vaccinations this month',
        price: 500,
      },
      {
        type: 'tip',
        title: 'Crop Rotation',
        description: 'Rotate maize with beans to improve soil health',
      },
    ];
  }

  private getSeverity(confidence: number): DiagnosisSeverity {
    if (confidence > 0.9) return DiagnosisSeverity.CRITICAL;
    if (confidence > 0.8) return DiagnosisSeverity.HIGH;
    if (confidence > 0.7) return DiagnosisSeverity.MEDIUM;
    return DiagnosisSeverity.LOW;
  }

  private getDescription(disease: string): string {
    const descriptions = {
      'Maize Leaf Rust': 'Fungal disease causing orange-brown pustules on leaves.',
      'Fall Armyworm': 'Pest that feeds on maize leaves, causing significant damage.',
      'Maize Lethal Necrosis': 'Viral disease causing yellowing and death of maize plants.',
      'Cercospora Leaf Spot': 'Fungal disease causing small necrotic spots on leaves.',
      'Northern Corn Leaf Blight': 'Fungal disease causing large elongated lesions on leaves.',
    };
    return descriptions[disease] || 'Disease detected. Consult a professional for details.';
  }

  private getRecommendedActions(disease: string): string[] {
    const actions = {
      'Maize Leaf Rust': [
        'Apply fungicide immediately',
        'Remove infected leaves',
        'Maintain proper spacing',
        'Monitor for spread',
      ],
      'Fall Armyworm': [
        'Apply recommended pesticides',
        'Manual removal of larvae',
        'Monitor crops daily',
        'Use pheromone traps',
      ],
    };
    return actions[disease] || [
      'Consult a professional',
      'Monitor affected area',
      'Document symptoms',
      'Maintain field hygiene',
    ];
  }

  private getPreventionTips(disease: string): string[] {
    return [
      'Use resistant varieties',
      'Practice crop rotation',
      'Maintain proper field hygiene',
      'Regular monitoring',
      'Apply preventive treatments',
    ];
  }
}