import { Module } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { PendaftaranController } from './pendaftaran.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Tambahkan ini
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
})
export class PendaftaranModule {}