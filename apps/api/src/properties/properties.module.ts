import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { InquiriesService } from '../inquiries/inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MapboxModule } from '../mapbox/mapbox.module';

@Module({
  imports: [
    PrismaModule,
    MapboxModule
  ],
  providers: [PropertiesService, InquiriesService],
  controllers: [PropertiesController],
  exports: [PropertiesService]
})
export class PropertiesModule {}
