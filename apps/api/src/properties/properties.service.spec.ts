import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { createTestingModuleFactory } from 'nest-spectator';
import { PrismaService } from '../prisma/prisma.service';
import { MapboxService } from '../mapbox/mapbox.service';

describe('PropertiesService', () => {
  let service: PropertiesService;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      providers: [PropertiesService],
      mocks: [PrismaService, MapboxService],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
