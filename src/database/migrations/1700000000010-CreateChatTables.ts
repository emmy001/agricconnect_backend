// src/database/migrations/1700000000010-CreateChatTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateChatTables1700000000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Chat Rooms Table
    await queryRunner.createTable(
      new Table({
        name: 'chat_rooms',
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
            isNullable: false,
          },
          {
            name: 'last_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'last_message_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
      'chat_rooms',
      new TableIndex({
        name: 'idx_chat_rooms_farmer_professional',
        columnNames: ['farmer_id', 'professional_id'],
        isUnique: true,
      }),
    );

    await queryRunner.createForeignKey(
      'chat_rooms',
      new TableForeignKey({
        columnNames: ['farmer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_rooms',
      new TableForeignKey({
        columnNames: ['professional_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    // Create Chat Messages Table
    await queryRunner.createTable(
      new Table({
        name: 'chat_messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'chat_room_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'sender_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'image', 'voice', 'file', 'location'],
            default: `'text'`,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'is_delivered',
            type: 'boolean',
            default: false,
          },
          {
            name: 'file_url',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'file_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'file_size',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
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
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'idx_chat_messages_chat_room_id',
        columnNames: ['chat_room_id'],
      }),
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'idx_chat_messages_sender_id',
        columnNames: ['sender_id'],
      }),
    );

    await queryRunner.createIndex(
      'chat_messages',
      new TableIndex({
        name: 'idx_chat_messages_created_at',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'chat_messages',
      new TableForeignKey({
        columnNames: ['chat_room_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'chat_rooms',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'chat_messages',
      new TableForeignKey({
        columnNames: ['sender_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chat_messages');
    await queryRunner.dropTable('chat_rooms');
  }
}