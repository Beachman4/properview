import { Module } from '@nestjs/common';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { InquiriesModule } from './inquiries/inquiries.module';

@Module({
  imports: [PropertiesModule, AuthModule, AgentsModule, InquiriesModule],
})
export class AgentModule {}
