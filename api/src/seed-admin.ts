import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const adminEmail = 'admin@muska.sch.id';
    const adminPassword = 'password123';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                role: 'ADMIN',
                password: hashedPassword,
                nama: 'Administrator SPMB MUSKA'
            }
        });
        console.log('Admin user updated successfully: admin@muska.sch.id / password123');
    } else {
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                nama: 'Administrator SPMB MUSKA',
                role: 'ADMIN',
            }
        });
        console.log('Admin user created successfully: admin@muska.sch.id / password123');
    }
}

main()
    .catch(e => {
        console.error('Error seeding admin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
