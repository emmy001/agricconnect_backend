// src/database/migrations/1700000000008-CreateAnimalsAndCropsTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAnimalsAndCropsTables1700000000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Animals Table
    await queryRunner.createTable(
      new Table({
        name: 'animals',
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
            name: 'type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'breed',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'age',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'weight',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'tag_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'birth_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'purchase_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'purchase_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'health_status',
            type: 'enum',
            enum: ['good', 'fair', 'poor', 'critical'],
            default: `'good'`,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: '{}',
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
      'animals',
      new TableIndex({
        name: 'idx_animals_farm_id',
        columnNames: ['farm_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'animals',
      new TableForeignKey({
        columnNames: ['farm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'farms',
        onDelete: 'CASCADE',
      }),
    );

    // Create Crops Table
    await queryRunner.createTable(
      new Table({
        name: 'crops',
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
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'variety',
            type: 'varchar',
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
            name: 'planting_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'expected_harvest',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'actual_harvest',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'yield_estimate',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'actual_yield',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'stage',
            type: 'enum',
            enum: ['planting', 'germination', 'vegetative', 'flowering', 'harvested'],
            default: `'planting'`,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: '{}',
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
      'crops',
      new TableIndex({
        name: 'idx_crops_farm_id',
        columnNames: ['farm_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'crops',
      new TableForeignKey({
        columnNames: ['farm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'farms',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('crops');
    await queryRunner.dropTable('animals');
  }
}