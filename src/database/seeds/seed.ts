// src/database/seeds/seed.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../../modules/users/entities/user.entity';
import { Professional } from '../../modules/professionals/entities/professional.entity';

export const seed = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const professionalRepository = dataSource.getRepository(Professional);

  // Create admin user
  const adminExists = await userRepository.findOne({
    where: { email: 'admin@agriconnect.com' },
  });

  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = userRepository.create({
      email: 'admin@agriconnect.com',
      password: hashedPassword,
      phoneNumber: '+254700000000',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      isVerified: true,
    });

    await userRepository.save(admin);
    console.log('Admin user created');
  }

  // Create sample farmer
  const farmerExists = await userRepository.findOne({
    where: { email: 'farmer@example.com' },
  });

  if (!farmerExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('farmer123', salt);

    const farmer = userRepository.create({
      email: 'farmer@example.com',
      password: hashedPassword,
      username: 'john_farmer',
      phoneNumber: '+254712345678',
      role: UserRole.FARMER,
      status: UserStatus.ACTIVE,
      isVerified: true,
    });

    await userRepository.save(farmer);
    console.log('Sample farmer created');
  }

  // Create sample professional
  const professionalExists = await userRepository.findOne({
    where: { email: 'professional@example.com' },
  });

  if (!professionalExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('professional123', salt);

    const professional = userRepository.create({
      email: 'professional@example.com',
      password: hashedPassword,
      username: 'dr_jane_mwangi',
      phoneNumber: '+254798765432',
      role: UserRole.PROFESSIONAL,
      status: UserStatus.ACTIVE,
      isVerified: true,
    });

    await userRepository.save(professional);

    // Create professional profile
    const profProfile = professionalRepository.create({
      userId: professional.id,
      bio: 'Experienced veterinarian with 10 years of practice',
      specialty: 'Veterinarian',
      experienceYears: 10,
      isAvailable: true,
      hasVehicle: true,
      pricing: {
        basePrice: 500,
        emergencyFee: 1000,
        distanceFeePerKm: 50,
        minimumPrice: 200,
        maximumPrice: 5000,
        currency: 'KES',
      },
      location: {
        latitude: -1.286389,
        longitude: 36.817223,
        address: 'Nairobi, Kenya',
      },
      skills: ['Livestock Health', 'Surgery', 'Vaccination'],
      languages: ['English', 'Swahili'],
    });

    await professionalRepository.save(profProfile);
    console.log('Sample professional created');
  }

  console.log('Database seeding completed');
};

// Run seed
import { config } from 'dotenv';
config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER || 'agriconnect',
  password: process.env.DATABASE_PASSWORD || 'agriconnect2024',
  database: process.env.DATABASE_NAME || 'agriconnect',
  entities: ['src/**/*.entity{.ts,.js}'],
});

dataSource.initialize()
  .then(async () => {
    await seed(dataSource);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });