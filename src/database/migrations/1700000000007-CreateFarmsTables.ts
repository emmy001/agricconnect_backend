// src/database/migrations/1700000000007-CreateFarmsTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFarmsTables1700000000007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM type for farm type
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE farm_type_enum AS ENUM ('crops', 'livestock', 'mixed', 'dairy', 'poultry');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create Farms Table
        await queryRunner.createTable(
            new Table({
                name: 'farms',
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
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'type',
                        type: 'farm_type_enum',
                        default: `'mixed'`,
                    },
                    {
                        name: 'size',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'location',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'registered_number',
                        type: 'varchar',
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
            'farms',
            new TableIndex({
                name: 'idx_farms_farmer_id',
                columnNames: ['farmer_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'farms',
            new TableForeignKey({
                columnNames: ['farmer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Create Farm Boundaries Table
        await queryRunner.createTable(
            new Table({
                name: 'farm_boundaries',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'farm_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'points',
                        type: 'jsonb',
                        isNullable: false,
                    },
                    {
                        name: 'area',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'varchar',
                        default: `'polygon'`,
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
            'farm_boundaries',
            new TableIndex({
                name: 'idx_farm_boundaries_farm_id',
                columnNames: ['farm_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'farm_boundaries',
            new TableForeignKey({
                columnNames: ['farm_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'farms',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('farm_boundaries');
        await queryRunner.dropTable('farms');
        await queryRunner.query(`DROP TYPE IF EXISTS farm_type_enum;`);
    }
}