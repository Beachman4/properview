import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from './properties.controller';
import { createTestingModuleFactory } from 'nest-spectator';
import { PropertiesService } from '../../properties/properties.service';
import { AuthService } from '../auth/auth.service';

describe('PropertiesController', () => {
  let controller: PropertiesController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      controllers: [PropertiesController],
      mocks: [PropertiesService, AuthService],
    }).compile();

    controller = module.get<PropertiesController>(PropertiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
