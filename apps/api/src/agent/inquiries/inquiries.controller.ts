import { Controller, UseGuards } from '@nestjs/common';
import { TsRest, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { InquiriesService } from '../../inquiries/inquiries.service';
import { contract } from '@properview/api-contract';
import { AuthedAgent } from '../../core/decorators/authed-agent.decorator';
import { Agent } from '@prisma/client';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { validate } from 'uuid';
import { TsRestResponseError } from '@ts-rest/core';

@Controller()
@TsRest({
  jsonQuery: true,
  validateResponses: true,
})
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @TsRestHandler(contract.agent.inquiries.list)
  @UseGuards(AgentAuthGuard)
  async listInquiries(@AuthedAgent() agent: Agent) {
    return tsRestHandler(contract.agent.inquiries.list, async ({ query }) => {
      if (query.propertyId && !validate(query.propertyId)) {
        throw new TsRestResponseError(contract.agent.inquiries.list, {
          status: 400,
          body: { message: 'Invalid propertyId' },
        });
      }

      const inquiries = await this.inquiriesService.paginateInquiries(
        agent.id,
        query.page,
        query.limit,
        query.propertyId,
      );
      return {
        status: 200,
        body: inquiries,
      };
    });
  }
}
