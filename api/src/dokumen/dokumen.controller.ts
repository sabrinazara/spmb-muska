import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DokumenService } from './dokumen.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('dokumen')
@UseGuards(AuthGuard)
export class DokumenController {
    constructor(private readonly dokumenService: DokumenService) { }

    @Post('scan-preview')
    @UseInterceptors(FileInterceptor('file'))
    async scanPreview(@UploadedFile() file: Express.Multer.File) {
        return this.dokumenService.scanPreview(file);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadDokumen(
        @Request() req: any,
        @UploadedFile() file: Express.Multer.File,
        @Body('pendaftaranId') bodyPendaftaranId?: string,
        @Body('jenisDokumen') jenisDokumen?: string,
        @Body('confirmedNik') confirmedNik?: string,
        @Body('confirmedText') confirmedText?: string,
    ) {
        const idToUse = bodyPendaftaranId || req.user.sub;
        return this.dokumenService.prosesUploadDokumen(
            file,
            idToUse,
            jenisDokumen || 'KTP',
            confirmedNik,
            confirmedText,
        );
    }
}