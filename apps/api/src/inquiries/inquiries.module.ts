import { Module } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';

@Module({
  providers: [InquiriesService]
})
export class InquiriesModule {}
