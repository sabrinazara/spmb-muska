import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(data: {
        email: string;
        password: string;
        nama?: string;
        namaLengkap?: string;
        nik?: string;
        nisn?: string;
        jurusan?: string;
        jurusanPilihan?: string;
    }) {
        // Cek apakah pendaftaran sedang dibuka oleh admin
        const settingBuka = await this.prisma.systemSetting.findUnique({ where: { key: 'bukaPendaftaran' } });
        if (settingBuka && settingBuka.value === 'false') {
            throw new BadRequestException('Pendaftaran SPMB saat ini sedang ditutup sementara oleh pihak panitia.');
        }

        const email = data.email?.trim().toLowerCase();
        const nama = (data.nama || data.namaLengkap || '').trim();
        const password = data.password;
        const nik = data.nik?.trim();
        const nisn = data.nisn?.trim();
        const jurusan = data.jurusan || data.jurusanPilihan;

        if (!email || !password) {
            throw new ConflictException('Email dan password wajib diisi');
        }

        // Cek apakah email sudah terdaftar
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email sudah digunakan');
        }

        // Jika NISN diisi, cek apakah NISN sudah digunakan
        if (nisn) {
            const existingNisn = await this.prisma.pendaftaran.findUnique({ where: { nisn } });
            if (existingNisn) {
                throw new ConflictException('NISN ini sudah terdaftar di sistem');
            }
        }

        // Hash kata sandi
        const hashedPassword = await bcrypt.hash(password, 10);

        // Simpan ke database beserta data pendaftaran jika diisi
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                nama: nama || null,
                role: 'USER', // Default pendaftar
                ...(nik && nisn && jurusan ? {
                    pendaftaran: {
                        create: {
                            nik,
                            nisn,
                            jurusan,
                            status: 'PENDING',
                        }
                    }
                } : {})
            },
            include: {
                pendaftaran: true,
            }
        });

        const payload = { sub: user.id, email: user.email, role: user.role };
        const access_token = await this.jwtService.signAsync(payload);

        return {
            message: 'Registrasi berhasil',
            userId: user.id,
            email: user.email,
            access_token,
            nama: user.nama,
            role: user.role,
            pendaftaran: user.pendaftaran,
            user: {
                id: user.id,
                email: user.email,
                nama: user.nama,
                role: user.role,
                pendaftaran: user.pendaftaran,
            },
        };
    }

    async login(email: string, pass: string) {
        const cleanEmail = email?.trim().toLowerCase();
        // Cari user berdasarkan email
        const user = await this.prisma.user.findUnique({
            where: { email: cleanEmail },
            include: {
                pendaftaran: {
                    include: {
                        dokumen: true,
                    }
                }
            }
        });
        if (!user) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        // Cocokkan kata sandi
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Kredensial tidak valid');
        }

        // Cek status pendaftaran jika login sebagai siswa / pendaftar
        if (user.role === 'USER') {
            const settingBuka = await this.prisma.systemSetting.findUnique({ where: { key: 'bukaPendaftaran' } });
            if (settingBuka && settingBuka.value === 'false') {
                throw new BadRequestException('Akses masuk akun siswa SPMB sedang ditutup sementara oleh pihak panitia.');
            }
        }

        // Buat JWT Token
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
            userId: user.id,
            nama: user.nama,
            role: user.role,
            pendaftaran: user.pendaftaran,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                pendaftaran: {
                    include: {
                        dokumen: true,
                    }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('User tidak ditemukan');
        }

        return {
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.role,
            pendaftaran: user.pendaftaran,
        };
    }
}