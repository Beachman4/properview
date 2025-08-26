import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { createTestingModuleFactory } from 'nest-spectator';
import { InquiriesService } from '../inquiries/inquiries.service';
import { PropertiesService } from './properties.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      controllers: [PropertiesController],
      mocks: [InquiriesService, PropertiesService],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
