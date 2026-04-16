import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../prisma/prisma.module'; // 🔥

@Module({
  imports: [PrismaModule], // 🔥 مهم جدًا
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
