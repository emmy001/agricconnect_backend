// src/database/migrations/1700000000001-CreateDevicesTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDevicesTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'devices',
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
            name: 'device_id',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'device_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'device_model',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'os_version',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'push_token',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'last_active',
            type: 'timestamp',
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
      'devices',
      new TableIndex({
        name: 'idx_devices_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'devices',
      new TableIndex({
        name: 'idx_devices_device_id',
        columnNames: ['device_id'],
      }),
    );

    await queryRunner.createForeignKey(
      'devices',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('devices');
  }
}