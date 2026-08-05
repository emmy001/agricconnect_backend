// src/database/migrations/1700000000003-CreateCertificationsTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCertificationsTable1700000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'certifications',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'professional_id',
                        type: 'uuid',
                        isNullable: false,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'issuer',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'year',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'certificate_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'expiry_date',
                        type: 'timestamp',
                        isNullable: true,
                    },
                    {
                        name: 'is_verified',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'notes',
                        type: 'text',
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
            'certifications',
            new TableIndex({
                name: 'idx_certifications_professional_id',
                columnNames: ['professional_id'],
            }),
        );

        await queryRunner.createForeignKey(
            'certifications',
            new TableForeignKey({
                columnNames: ['professional_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'professionals',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('certifications');
    }
}