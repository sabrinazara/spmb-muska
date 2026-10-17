import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        // Membaca URL database dari file .env
        const connectionString = process.env.DATABASE_URL;

        // Membuat pool koneksi menggunakan driver 'pg'
        const pool = new Pool({ connectionString });
        const adapter = new PrismaPg(pool);

        // Meneruskan adapter ke constructor PrismaClient bawaan
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }
}