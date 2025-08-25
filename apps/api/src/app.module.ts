import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import appConfig from "./config/app.config";
import { configValidationSchema } from "./config/validation.schema";
import { ConfigModule } from '@nestjs/config';
import { PropertiesModule } from './properties/properties.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { AgentModule } from './agent/agent.module';
import { MapboxModule } from './mapbox/mapbox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      validate: (config) => configValidationSchema.parse(config),
    }),
    PrismaModule,
    PropertiesModule,
    InquiriesModule,
    AgentModule,
    MapboxModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
