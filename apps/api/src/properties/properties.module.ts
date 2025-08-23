import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { InquiriesService } from '../inquiries/inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PropertiesService, InquiriesService],
  controllers: [PropertiesController]
})
export class PropertiesModule {}
