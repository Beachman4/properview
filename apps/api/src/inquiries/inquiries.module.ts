import { Module } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule
  ],
  providers: [InquiriesService],
  exports: [InquiriesService]
})
export class InquiriesModule {}
