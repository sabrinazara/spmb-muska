import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    console.log('🚀 Starting Data Migration: Local PostgreSQL -> Supabase...\n');

    const localUrl = process.env.LOCAL_DATABASE_URL;
    const supabaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

    if (!localUrl) {
        throw new Error('LOCAL_DATABASE_URL is not set in .env');
    }
    if (!supabaseUrl) {
        throw new Error('DIRECT_URL or DATABASE_URL is not set in .env');
    }

    console.log('📡 Connecting to Local Database...');
    const localPool = new Pool({ connectionString: localUrl });
    const localAdapter = new PrismaPg(localPool);
    const localPrisma = new PrismaClient({ adapter: localAdapter });

    console.log('📡 Connecting to Supabase Database...');
    const supabasePool = new Pool({ connectionString: supabaseUrl });
    const supabaseAdapter = new PrismaPg(supabasePool);
    const supabasePrisma = new PrismaClient({ adapter: supabaseAdapter });

    try {
        await localPrisma.$connect();
        console.log('✅ Connected to Local DB');
        await supabasePrisma.$connect();
        console.log('✅ Connected to Supabase DB\n');

        // Order of insertion matters due to foreign key relationships:
        // 1. Independent models: Jurusan, SystemSetting, HeroSlider, ProfilSekolah, ProfilWKS, Guru, ProgramKeahlian, MitraIndustri, Berita, KnowledgeBase, AuditLog
        // 2. User -> Pendaftaran -> Dokumen

        // --- 1. User ---
        console.log('📦 Migrating User...');
        const users = await localPrisma.user.findMany();
        for (const item of users) {
            await supabasePrisma.user.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${users.length} Users`);

        // --- 2. Jurusan ---
        console.log('📦 Migrating Jurusan...');
        const jurusans = await localPrisma.jurusan.findMany();
        for (const item of jurusans) {
            await supabasePrisma.jurusan.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${jurusans.length} Jurusan`);

        // --- 3. Pendaftaran (FK: User) ---
        console.log('📦 Migrating Pendaftaran...');
        const pendaftarans = await localPrisma.pendaftaran.findMany();
        for (const item of pendaftarans) {
            await supabasePrisma.pendaftaran.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${pendaftarans.length} Pendaftaran`);

        // --- 4. Dokumen (FK: Pendaftaran) ---
        console.log('📦 Migrating Dokumen...');
        const dokumens = await localPrisma.dokumen.findMany();
        for (const item of dokumens) {
            await supabasePrisma.dokumen.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${dokumens.length} Dokumen`);

        // --- 5. AuditLog ---
        console.log('📦 Migrating AuditLog...');
        const auditLogs = await localPrisma.auditLog.findMany();
        for (const item of auditLogs) {
            await supabasePrisma.auditLog.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${auditLogs.length} AuditLog`);

        // --- 6. KnowledgeBase ---
        console.log('📦 Migrating KnowledgeBase...');
        const kbList = await localPrisma.knowledgeBase.findMany();
        for (const item of kbList) {
            await supabasePrisma.knowledgeBase.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${kbList.length} KnowledgeBase`);

        // --- 7. SystemSetting ---
        console.log('📦 Migrating SystemSetting...');
        const settings = await localPrisma.systemSetting.findMany();
        for (const item of settings) {
            await supabasePrisma.systemSetting.upsert({
                where: { key: item.key },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${settings.length} SystemSetting`);

        // --- 8. HeroSlider ---
        console.log('📦 Migrating HeroSlider...');
        const sliders = await localPrisma.heroSlider.findMany();
        for (const item of sliders) {
            await supabasePrisma.heroSlider.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${sliders.length} HeroSlider`);

        // --- 9. ProfilSekolah ---
        console.log('📦 Migrating ProfilSekolah...');
        const profilList = await localPrisma.profilSekolah.findMany();
        for (const item of profilList) {
            await supabasePrisma.profilSekolah.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${profilList.length} ProfilSekolah`);

        // --- 10. ProfilWKS ---
        console.log('📦 Migrating ProfilWKS...');
        const wksList = await localPrisma.profilWKS.findMany();
        for (const item of wksList) {
            await supabasePrisma.profilWKS.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${wksList.length} ProfilWKS`);

        // --- 11. Guru ---
        console.log('📦 Migrating Guru...');
        const guruList = await localPrisma.guru.findMany();
        for (const item of guruList) {
            await supabasePrisma.guru.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${guruList.length} Guru`);

        // --- 12. ProgramKeahlian ---
        console.log('📦 Migrating ProgramKeahlian...');
        const programList = await localPrisma.programKeahlian.findMany();
        for (const item of programList) {
            await supabasePrisma.programKeahlian.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${programList.length} ProgramKeahlian`);

        // --- 13. MitraIndustri ---
        console.log('📦 Migrating MitraIndustri...');
        const mitraList = await localPrisma.mitraIndustri.findMany();
        for (const item of mitraList) {
            await supabasePrisma.mitraIndustri.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${mitraList.length} MitraIndustri`);

        // --- 14. Berita ---
        console.log('📦 Migrating Berita...');
        const beritaList = await localPrisma.berita.findMany();
        for (const item of beritaList) {
            await supabasePrisma.berita.upsert({
                where: { id: item.id },
                update: item,
                create: item,
            });
        }
        console.log(`   ✔ Migrated ${beritaList.length} Berita`);

        console.log('\n📊 Migration Summary & Verification:');
        console.log('---------------------------------------------------------');
        const verification = [
            { Table: 'User', Local: users.length, Supabase: await supabasePrisma.user.count() },
            { Table: 'Jurusan', Local: jurusans.length, Supabase: await supabasePrisma.jurusan.count() },
            { Table: 'Pendaftaran', Local: pendaftarans.length, Supabase: await supabasePrisma.pendaftaran.count() },
            { Table: 'Dokumen', Local: dokumens.length, Supabase: await supabasePrisma.dokumen.count() },
            { Table: 'AuditLog', Local: auditLogs.length, Supabase: await supabasePrisma.auditLog.count() },
            { Table: 'KnowledgeBase', Local: kbList.length, Supabase: await supabasePrisma.knowledgeBase.count() },
            { Table: 'SystemSetting', Local: settings.length, Supabase: await supabasePrisma.systemSetting.count() },
            { Table: 'HeroSlider', Local: sliders.length, Supabase: await supabasePrisma.heroSlider.count() },
            { Table: 'ProfilSekolah', Local: profilList.length, Supabase: await supabasePrisma.profilSekolah.count() },
            { Table: 'ProfilWKS', Local: wksList.length, Supabase: await supabasePrisma.profilWKS.count() },
            { Table: 'Guru', Local: guruList.length, Supabase: await supabasePrisma.guru.count() },
            { Table: 'ProgramKeahlian', Local: programList.length, Supabase: await supabasePrisma.programKeahlian.count() },
            { Table: 'MitraIndustri', Local: mitraList.length, Supabase: await supabasePrisma.mitraIndustri.count() },
            { Table: 'Berita', Local: beritaList.length, Supabase: await supabasePrisma.berita.count() },
        ];
        console.table(verification);
        console.log('🎉 Data migration completed successfully!');
    } catch (err) {
        console.error('❌ Error during migration:', err);
        process.exit(1);
    } finally {
        await localPrisma.$disconnect();
        await localPool.end();
        await supabasePrisma.$disconnect();
        await supabasePool.end();
    }
}

main();
