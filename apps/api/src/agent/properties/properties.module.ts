import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { PropertiesModule as PropertiesModulePublic } from '../../properties/properties.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PropertiesModulePublic, AuthModule],
  controllers: [PropertiesController],
})
export class PropertiesModule {}
