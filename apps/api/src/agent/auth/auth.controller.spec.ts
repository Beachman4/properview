import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { createTestingModuleFactory } from 'nest-spectator';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      controllers: [AuthController],
      mocks: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
