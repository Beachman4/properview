import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { InquiriesModule as InquiriesModuleBase } from '../../inquiries/inquiries.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [InquiriesController],
  imports: [InquiriesModuleBase, AuthModule]
})
export class InquiriesModule {}
