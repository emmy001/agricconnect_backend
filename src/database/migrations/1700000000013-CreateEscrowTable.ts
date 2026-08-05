// src/database/migrations/1700000000013-CreateEscrowTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateEscrowTable1700000000013 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create ENUM type for escrow status
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE escrow_status_enum AS ENUM ('holding', 'released', 'refunded', 'disputed');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.createTable(
            new Table({
                name: 'escrow',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'payment_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'payer_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'payee_id',
                        type: 'uuid',
                        isNullable: false,
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
                        name: 'status',
                        type: 'escrow_status_enum',
                        default: `'holding'`,
                    },
                    {
                        name: 'release_date',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'released_to',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'released_by',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'conditions',
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
            'escrow',
            new TableIndex({
                name: 'idx_escrow_payment_id',
                columnNames: ['payment_id'],
            }),
        );

        await queryRunner.createIndex(
            'escrow',
            new TableIndex({
                name: 'idx_escrow_status',
                columnNames: ['status'],
            }),
        );

        await queryRunner.createForeignKey(
            'escrow',
            new TableForeignKey({
                columnNames: ['payment_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'payments',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'escrow',
            new TableForeignKey({
                columnNames: ['payer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );

        await queryRunner.createForeignKey(
            'escrow',
            new TableForeignKey({
                columnNames: ['payee_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('escrow');
        await queryRunner.query(`DROP TYPE IF EXISTS escrow_status_enum;`);
    }
}