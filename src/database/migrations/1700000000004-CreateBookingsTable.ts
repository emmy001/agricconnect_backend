// src/database/migrations/1700000000004-CreateBookingsTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBookingsTable1700000000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'bookings',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'farmer_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'professional_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'service_id',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'category',
                        type: 'enum',
                        enum: [
                            'veterinarian',
                            'crop_doctor',
                            'agronomist',
                            'artificial_insemination',
                            'livestock_vaccination',
                            'pest_control',
                            'farm_equipment_repair',
                            'soil_testing',
                            'drone_spraying',
                            'irrigation_installation',
                            'greenhouse_experts',
                            'poultry',
                            'pig_farming',
                            'dairy_farming',
                            'fish_farming',
                            'bee_keeping',
                            'farm_labour',
                            'land_preparation',
                            'tractor_hire',
                            'seed_consultation',
                            'fertilizer_consultation',
                            'harvesting',
                            'transport',
                            'storage',
                            'insurance',
                            'financial_services',
                        ],
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: ['pending', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled', 'expired'],
                        default: `'pending'`,
                    },
                    {
                        name: 'requested_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'scheduled_start',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'scheduled_end',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'started_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'completed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'pickup_location',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'dropoff_location',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'distance',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'estimated_price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'final_price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'images',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'documents',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'is_emergency',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'rating',
                        type: 'int',
                        isNullable: true,
                    },
                    {
                        name: 'review',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        default: () => "'{}'::jsonb",
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true,
        );

        await queryRunner.createIndex(
            'bookings',
            new TableIndex({
                name: 'idx_bookings_farmer_id',
                columnNames: ['farmer_id'],
            }),
        );

        await queryRunner.createIndex(
            'bookings',
            new TableIndex({
                name: 'idx_bookings_professional_id',
                columnNames: ['professional_id'],
            }),
        );

        await queryRunner.createIndex(
            'bookings',
            new TableIndex({
                name: 'idx_bookings_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'bookings',
            new TableIndex({
                name: 'idx_bookings_requested_at',
                columnNames: ['requested_at'],
            }),
        );

        await queryRunner.createForeignKey(
            'bookings',
            new TableForeignKey({
                columnNames: ['farmer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'bookings',
            new TableForeignKey({
                columnNames: ['professional_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'professionals',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('bookings');
    }
}