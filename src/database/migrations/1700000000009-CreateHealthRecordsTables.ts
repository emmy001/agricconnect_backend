// src/database/migrations/1700000000009-CreateHealthRecordsTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHealthRecordsTables1700000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Health Records Table
    await queryRunner.createTable(
      new Table({
        name: 'health_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'animal_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['checkup', 'treatment', 'surgery', 'lab_test', 'vaccination', 'birth', 'death', 'other'],
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'veterinarian',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'treatment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'medication',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'diagnosis',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'prognosis',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'next_checkup',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: `'Completed'`,
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
      'health_records',
      new TableIndex({
        name: 'idx_health_records_animal_id',
        columnNames: ['animal_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'health_records',
      new TableForeignKey({
        columnNames: ['animal_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'animals',
        onDelete: 'CASCADE',
      }),
    );

    // Create Vaccinations Table
    await queryRunner.createTable(
      new Table({
        name: 'vaccinations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'animal_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'vaccine_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'administered_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'administered_by',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'batch_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'next_due_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'administered', 'overdue', 'cancelled'],
            default: `'pending'`,
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
      'vaccinations',
      new TableIndex({
        name: 'idx_vaccinations_animal_id',
        columnNames: ['animal_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'vaccinations',
      new TableForeignKey({
        columnNames: ['animal_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'animals',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('vaccinations');
    await queryRunner.dropTable('health_records');
  }
}