import { TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';
import { createTestingModuleFactory } from 'nest-spectator';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('AgentsService', () => {
  let service: AgentsService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      providers: [AgentsService],
      mocks: [PrismaService, AuthService],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
