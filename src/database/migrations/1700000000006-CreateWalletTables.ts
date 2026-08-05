// src/database/migrations/1700000000006-CreateWalletTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateWalletTables1700000000006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM types for wallet
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE wallet_transaction_type_enum AS ENUM (
                    'deposit', 'withdrawal', 'payment', 'refund', 'bonus', 'referral', 'subscription'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE wallet_transaction_status_enum AS ENUM (
                    'pending', 'completed', 'failed', 'cancelled'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create Wallets Table
        await queryRunner.createTable(
            new Table({
                name: 'wallets',
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
                        name: 'balance',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'currency',
                        type: 'varchar',
                        default: `'KES'`,
                    },
                    {
                        name: 'total_earned',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'total_spent',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'total_withdrawn',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'bonus_points',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        default: 0,
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
            'wallets',
            new TableIndex({
                name: 'idx_wallets_user_id',
                columnNames: ['user_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'wallets',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        // Create Wallet Transactions Table
        await queryRunner.createTable(
            new Table({
                name: 'wallet_transactions',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'wallet_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'type',
                        type: 'wallet_transaction_type_enum',
                        isNullable: false,
                    },
                    {
                        name: 'status',
                        type: 'wallet_transaction_status_enum',
                        default: `'pending'`,
                    },
                    {
                        name: 'amount',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'balance',
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
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'reference',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'related_id',
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
                        name: 'completed_at',
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
            'wallet_transactions',
            new TableIndex({
                name: 'idx_wallet_transactions_wallet_id',
                columnNames: ['wallet_id'],
            }),
        );

        await queryRunner.createIndex(
            'wallet_transactions',
            new TableIndex({
                name: 'idx_wallet_transactions_type',
                columnNames: ['type'],
            }),
        );

        await queryRunner.createIndex(
            'wallet_transactions',
            new TableIndex({
                name: 'idx_wallet_transactions_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createIndex(
            'wallet_transactions',
            new TableIndex({
                name: 'idx_wallet_transactions_created_at',
                columnNames: ['created_at'],
            }),
        );

        await queryRunner.createForeignKey(
            'wallet_transactions',
            new TableForeignKey({
                columnNames: ['wallet_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'wallets',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('wallet_transactions');
        await queryRunner.dropTable('wallets');
        await queryRunner.query(`DROP TYPE IF EXISTS wallet_transaction_type_enum;`);
        await queryRunner.query(`DROP TYPE IF EXISTS wallet_transaction_status_enum;`);
    }
}