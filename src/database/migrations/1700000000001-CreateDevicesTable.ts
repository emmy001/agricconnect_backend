// src/database/migrations/1700000000002-CreateProfessionalsTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateProfessionalsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'professionals',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'gen_random_uuid()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'specialty',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'experience_years',
            type: 'decimal',
            precision: 4,
            scale: 2,
            default: 0,
          },
          {
            name: 'response_time',
            type: 'int',
            default: 0,
          },
          {
            name: 'completion_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'acceptance_rate',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          {
            name: 'jobs_completed',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: false,
          },
          {
            name: 'has_vehicle',
            type: 'boolean',
            default: false,
          },
          {
            name: 'pricing',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'skills',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'languages',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'equipment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verification_status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'suspended'],
            default: "'pending'",
          },
          {
            name: 'verification_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'verified_by',
            type: 'uuid',
            isNullable: true,
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'professionals',
      new TableIndex({
        name: 'idx_professionals_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'professionals',
      new TableIndex({
        name: 'idx_professionals_verification_status',
        columnNames: ['verification_status'],
      }),
    );

    await queryRunner.createForeignKey(
      'professionals',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('professionals');
  }
}