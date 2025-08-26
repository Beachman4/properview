import { TestingModule } from '@nestjs/testing';
import { InquiriesController } from './inquiries.controller';
import { createTestingModuleFactory } from 'nest-spectator';
import { InquiriesService } from '../../inquiries/inquiries.service';
import { AuthService } from '../auth/auth.service';

describe('InquiriesController', () => {
  let controller: InquiriesController;

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      controllers: [InquiriesController],
      mocks: [InquiriesService, AuthService],
    }).compile();

    controller = module.get<InquiriesController>(InquiriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
