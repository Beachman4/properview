import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AgentsService],
  exports: [AgentsService]
})
export class AgentsModule {}
