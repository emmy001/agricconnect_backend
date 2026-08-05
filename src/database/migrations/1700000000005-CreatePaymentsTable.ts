// src/database/migrations/1700000000005-CreatePaymentsTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePaymentsTable1700000000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE payment_method_enum AS ENUM ('mpesa', 'card', 'bank_transfer', 'wallet', 'escrow');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE payment_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.createTable(
            new Table({
                name: 'payments',
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
                        name: 'booking_id',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        default: `'KES'`,
                    },
                    {
                        name: 'method',
                        type: 'payment_method_enum',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'payment_status_enum',
                        default: `'pending'`,
                    },
                    {
                        name: 'reference',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'transaction_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'mpesa_checkout_request_id',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'mpesa_receipt_number',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'card_last_four',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'bank_name',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'bank_account_number',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'description',
                        type: 'text',
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
                        name: 'completed_at',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'refunded_at',
                        type: 'timestamp',
                        isNullable: true,
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
            'payments',
            new TableIndex({
                name: 'idx_payments_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_booking_id',
                columnNames: ['booking_id'],
            }),
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'payments',
            new TableIndex({
                name: 'idx_payments_created_at',
                columnNames: ['created_at'],
            }),
        );

        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'payments',
            new TableForeignKey({
                columnNames: ['booking_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'bookings',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('payments');
        await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum;`);
        await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum;`);
    }
}