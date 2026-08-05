// src/database/migrations/1700000000014-CreateAITables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAITables1700000000014 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM type for diagnosis severity
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE diagnosis_severity_enum AS ENUM ('low', 'medium', 'high', 'critical');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create Diagnoses Table
        await queryRunner.createTable(
            new Table({
                name: 'diagnoses',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'disease_name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: false,
                    },
                    {
                        name: 'confidence',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'severity',
                        type: 'diagnosis_severity_enum',
                        default: `'medium'`,
                    },
                    {
                        name: 'image_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'recommended_professional_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'recommended_actions',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'prevention_tips',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        default: "'{}'::jsonb",
                    },
                    {
                        name: 'detected_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
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
            'diagnoses',
            new TableIndex({
                name: 'idx_diagnoses_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'diagnoses',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Create Predictions Table
        await queryRunner.createTable(
            new Table({
                name: 'predictions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'crop_type',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'predicted_yield',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'confidence',
                        type: 'decimal',
                        precision: 5,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'best_season',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'factors',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'monthly_predictions',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'metadata',
                        type: 'jsonb',
                        default: "'{}'::jsonb",
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
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
            'predictions',
            new TableIndex({
                name: 'idx_predictions_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'predictions',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('predictions');
        await queryRunner.dropTable('diagnoses');
        await queryRunner.query(`DROP TYPE IF EXISTS diagnosis_severity_enum;`);
    }
}