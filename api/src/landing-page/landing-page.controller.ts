import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as path from 'path';
import * as fs from 'fs';
import { LandingPageService } from './landing-page.service';
import { AdminGuard } from '../admin/admin.guard';

// Storage configuration for Website CMS image uploads
const websiteImageStorage = diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/website';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `cms-${uniqueSuffix}${ext}`);
    },
});

const imageFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (
        !file.mimetype.match(/^image\/(jpeg|png|jpg|gif|webp|svg\+xml)$/i) &&
        !file.originalname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
    ) {
        return cb(new BadRequestException('Format berkas harus berupa gambar (JPG, PNG, WEBP, GIF, atau SVG)'), false);
    }
    cb(null, true);
};

@Controller('landing-page')
export class LandingPageController {
    constructor(private readonly landingService: LandingPageService) { }

    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    @Get()
    async getPublicData() {
        return this.landingService.getPublicLandingData();
    }

    @Get('berita')
    async getPublicBerita() {
        return this.landingService.getPublicBerita();
    }

    @Get('berita/:slugOrId')
    async getPublicBeritaDetail(@Param('slugOrId') slugOrId: string) {
        return this.landingService.getPublicBeritaBySlugOrId(slugOrId);
    }

    @Get('jurusan')
    async getPublicJurusan() {
        return this.landingService.getPublicPrograms();
    }

    @Get('jurusan/:idOrSlug')
    async getPublicJurusanDetail(@Param('idOrSlug') idOrSlug: string) {
        return this.landingService.getPublicProgramByIdOrSlug(idOrSlug);
    }

    @Get('agenda')
    async getPublicAgenda() {
        return this.landingService.getAgenda();
    }

    @Get('agenda/:id')
    async getPublicAgendaDetail(@Param('id') id: string) {
        return this.landingService.getAgendaById(id);
    }

    @Get('prestasi')
    async getPublicPrestasi() {
        return this.landingService.getPrestasi();
    }

    @Get('prestasi/:id')
    async getPublicPrestasiDetail(@Param('id') id: string) {
        return this.landingService.getPrestasiById(id);
    }

    @Get('galeri')
    async getPublicGaleri() {
        return this.landingService.getPublicGaleri();
    }

    @Get('galeri/:slugOrId')
    async getPublicGaleriDetail(@Param('slugOrId') slugOrId: string) {
        return this.landingService.getPublicGaleriBySlugOrId(slugOrId);
    }

    // ==========================================
    // ADMIN ENDPOINTS (PROTECTED BY ADMINGUARD)
    // ==========================================

    // UPLOAD GAMBAR WEBSITE CMS
    @UseGuards(AdminGuard)
    @Post('admin/upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: websiteImageStorage,
            fileFilter: imageFileFilter,
            limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        }),
    )
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Berkas gambar wajib diunggah');
        }

        const relativeUrl = `/uploads/website/${file.filename}`;

        // Sinkronisasi otomatis ke folder public user dan cms agar langsung terbaca tanpa reload
        try {
            const userDir = path.resolve(process.cwd(), '../user/public/uploads/website');
            if (!fs.existsSync(userDir)) {
                fs.mkdirSync(userDir, { recursive: true });
            }
            fs.copyFileSync(file.path, path.join(userDir, file.filename));
        } catch {
            // non-blocking
        }

        try {
            const cmsDir = path.resolve(process.cwd(), '../cms/public/uploads/website');
            if (!fs.existsSync(cmsDir)) {
                fs.mkdirSync(cmsDir, { recursive: true });
            }
            fs.copyFileSync(file.path, path.join(cmsDir, file.filename));
        } catch {
            // non-blocking
        }

        return {
            url: relativeUrl,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
        };
    }

    // 1. SLIDERS
    @UseGuards(AdminGuard)
    @Get('admin/sliders')
    async getSliders() {
        return this.landingService.getSliders();
    }

    @UseGuards(AdminGuard)
    @Post('admin/sliders')
    async createSlider(@Body() body: any, @Request() req: any) {
        return this.landingService.createSlider(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/sliders/:id')
    async updateSlider(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateSlider(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/sliders/:id')
    async deleteSlider(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteSlider(id, req.user);
    }

    // 2. PROFIL SEKOLAH
    @UseGuards(AdminGuard)
    @Get('admin/profil')
    async getProfil() {
        return this.landingService.getProfil();
    }

    @UseGuards(AdminGuard)
    @Put('admin/profil')
    async updateProfil(@Body() body: any, @Request() req: any) {
        return this.landingService.updateProfil(body, req.user);
    }

    // 3. WKS (WAKIL KEPALA SEKOLAH)
    @UseGuards(AdminGuard)
    @Get('admin/wks')
    async getWKS() {
        return this.landingService.getWKS();
    }

    @UseGuards(AdminGuard)
    @Post('admin/wks')
    async createWKS(@Body() body: any, @Request() req: any) {
        return this.landingService.createWKS(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/wks/:id')
    async updateWKS(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateWKS(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/wks/:id')
    async deleteWKS(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteWKS(id, req.user);
    }

    // 3.5. DEWAN GURU & TENAGA PENDIDIK
    @UseGuards(AdminGuard)
    @Get('admin/guru')
    async getGuru() {
        return this.landingService.getGuru();
    }

    @UseGuards(AdminGuard)
    @Post('admin/guru')
    async createGuru(@Body() body: any, @Request() req: any) {
        return this.landingService.createGuru(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/guru/:id')
    async updateGuru(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateGuru(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/guru/:id')
    async deleteGuru(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteGuru(id, req.user);
    }

    // 4. PROGRAM KEAHLIAN
    @UseGuards(AdminGuard)
    @Get('admin/programs')
    async getPrograms() {
        return this.landingService.getPrograms();
    }

    @UseGuards(AdminGuard)
    @Post('admin/programs')
    async createProgram(@Body() body: any, @Request() req: any) {
        return this.landingService.createProgram(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/programs/:id')
    async updateProgram(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateProgram(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/programs/:id')
    async deleteProgram(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteProgram(id, req.user);
    }

    // 5. MITRA INDUSTRI (DUDI)
    @UseGuards(AdminGuard)
    @Get('admin/mitra')
    async getMitra() {
        return this.landingService.getMitra();
    }

    @UseGuards(AdminGuard)
    @Post('admin/mitra')
    async createMitra(@Body() body: any, @Request() req: any) {
        return this.landingService.createMitra(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/mitra/:id')
    async updateMitra(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateMitra(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/mitra/:id')
    async deleteMitra(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteMitra(id, req.user);
    }

    // 6. BERITA & PENGUMUMAN
    @UseGuards(AdminGuard)
    @Get('admin/berita')
    async getBerita() {
        return this.landingService.getBerita();
    }

    @UseGuards(AdminGuard)
    @Post('admin/berita')
    async createBerita(@Body() body: any, @Request() req: any) {
        return this.landingService.createBerita(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/berita/:id')
    async updateBerita(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateBerita(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/berita/:id')
    async deleteBerita(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteBerita(id, req.user);
    }

    // 7. AGENDA SEKOLAH
    @UseGuards(AdminGuard)
    @Get('admin/agenda')
    async getAgenda() {
        return this.landingService.getAgenda();
    }

    @UseGuards(AdminGuard)
    @Post('admin/agenda')
    async createAgenda(@Body() body: any, @Request() req: any) {
        return this.landingService.createAgenda(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/agenda/:id')
    async updateAgenda(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateAgenda(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/agenda/:id')
    async deleteAgenda(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteAgenda(id, req.user);
    }

    // 8. PRESTASI SISWA
    @UseGuards(AdminGuard)
    @Get('admin/prestasi')
    async getPrestasi() {
        return this.landingService.getPrestasi();
    }

    @UseGuards(AdminGuard)
    @Post('admin/prestasi')
    async createPrestasi(@Body() body: any, @Request() req: any) {
        return this.landingService.createPrestasi(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/prestasi/:id')
    async updatePrestasi(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updatePrestasi(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/prestasi/:id')
    async deletePrestasi(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deletePrestasi(id, req.user);
    }

    // 9. GALERI SEKOLAH
    @UseGuards(AdminGuard)
    @Get('admin/galeri')
    async getGaleri() {
        return this.landingService.getGaleri();
    }

    @UseGuards(AdminGuard)
    @Post('admin/galeri')
    async createGaleri(@Body() body: any, @Request() req: any) {
        return this.landingService.createGaleri(body, req.user);
    }

    @UseGuards(AdminGuard)
    @Put('admin/galeri/:id')
    async updateGaleri(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.landingService.updateGaleri(id, body, req.user);
    }

    @UseGuards(AdminGuard)
    @Delete('admin/galeri/:id')
    async deleteGaleri(@Param('id') id: string, @Request() req: any) {
        return this.landingService.deleteGaleri(id, req.user);
    }
}
