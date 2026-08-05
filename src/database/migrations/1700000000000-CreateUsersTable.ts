// src/database/migrations/1700000000000-CreateUsersTable.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUsersTable1700000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types for users table
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE user_role_enum AS ENUM ('farmer', 'professional', 'admin');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'pending', 'blocked');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create Users Table
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isUnique: true,
                        isNullable: false,
                    },
                    {
                        name: 'phone_number',
                        type: 'varchar',
                        length: '20',
                        isUnique: true,
                        isNullable: true,
                    },
                    {
                        name: 'password',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'first_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'last_name',
                        type: 'varchar',
                        length: '100',
                        isNullable: false,
                    },
                    {
                        name: 'profile_image',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'role',
                        type: 'user_role_enum',
                        default: `'farmer'`,
                    },
                    {
                        name: 'status',
                        type: 'user_status_enum',
                        default: `'active'`,
                    },
                    {
                        name: 'is_verified',
                        type: 'boolean',
                        default: false,
                    },
                    {
                        name: 'rating',
                        type: 'decimal',
                        precision: 3,
                        scale: 2,
                        default: 0,
                    },
                    {
                        name: 'total_reviews',
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
                    {
                        name: 'last_login',
                        type: 'timestamp',
                        isNullable: true,
                    },
                ],
            }),
            true,
        );

        // Create indexes
        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_email',
                columnNames: ['email'],
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_phone_number',
                columnNames: ['phone_number'],
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_role',
                columnNames: ['role'],
            }),
        );

        await queryRunner.createIndex(
            'users',
            new TableIndex({
                name: 'idx_users_status',
                columnNames: ['status'],
            }),
        );

        // Create User Profiles Table
        await queryRunner.createTable(
            new Table({
                name: 'user_profiles',
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
                        name: 'bio',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'address',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'city',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'state',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'country',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'postal_code',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'preferences',
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

        // Add foreign key for user_profiles
        await queryRunner.createForeignKey(
            'user_profiles',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_profiles');
        await queryRunner.dropTable('users');
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum;`);
        await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum;`);
    }
}