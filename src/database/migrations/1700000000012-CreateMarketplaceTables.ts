// src/database/migrations/1700000000012-CreateMarketplaceTables.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateMarketplaceTables1700000000012 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Categories Table
        await queryRunner.createTable(
            new Table({
                name: 'categories',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'icon',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'image_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'product_count',
                        type: 'int',
                        default: 0,
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

        // Create Products Table
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'category_id',
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
                        isNullable: false,
                    },
                    {
                        name: 'price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: 'image_url',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'images',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'reviews',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'stock',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'in_stock',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'unit',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'tags',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'specifications',
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
            'products',
            new TableIndex({
                name: 'idx_products_category_id',
                columnNames: ['category_id'],
            }),
        );

        await queryRunner.createIndex(
            'products',
            new TableIndex({
                name: 'idx_products_in_stock',
                columnNames: ['in_stock'],
            }),
        );

        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('products');
        await queryRunner.dropTable('categories');
    }
}