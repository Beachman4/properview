import { Controller, UseGuards } from '@nestjs/common';
import { TsRest, TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PropertiesService } from '../../properties/properties.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { AuthedAgent } from '../../core/decorators/authed-agent.decorator';
import { Agent } from '@prisma/client';
import { contract } from '@properview/api-contract';
import { validateUuid } from '../../utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { TsRestResponseError } from '@ts-rest/core';
import { InvalidUUIDError } from '../../core/errors/InvalidUUID.error';

@Controller()
@TsRest({
  jsonQuery: true,
  validateResponses: true,
})
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @UseGuards(AgentAuthGuard)
  @TsRestHandler(contract.agent.properties.list)
  list(@AuthedAgent() agent: Agent) {
    return tsRestHandler(contract.agent.properties.list, async ({ query }) => {
      const properties = await this.propertiesService.paginateByAgentId(
        agent.id,
        query.page,
        query.limit,
      );
      return {
        status: 200,
        body: properties,
      };
    });
  }

  @UseGuards(AgentAuthGuard)
  @TsRestHandler(contract.agent.properties.get)
  get(@AuthedAgent() agent: Agent) {
    return tsRestHandler(contract.agent.properties.get, async ({ params }) => {
      try {
        validateUuid(params.id);
        const property = await this.propertiesService.retrieveByIdAndAgentId(
          params.id,
          agent.id,
        );

        return {
          status: 200,
          body: property,
        };
      } catch (error) {
        if (error instanceof InvalidUUIDError) {
          throw new TsRestResponseError(contract.agent.properties.get, {
            status: 404,
            body: { message: 'Property not found' },
          });
        }

        if (
          error instanceof PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new TsRestResponseError(contract.agent.properties.get, {
            status: 404,
            body: { message: 'Property not found' },
          });
        }

        throw new TsRestResponseError(contract.agent.properties.get, {
          status: 500,
          body: { message: 'Internal server error' },
        });
      }
    });
  }

  @UseGuards(AgentAuthGuard)
  @TsRestHandler(contract.agent.properties.create)
  create(@AuthedAgent() agent: Agent) {
    return tsRestHandler(contract.agent.properties.create, async ({ body }) => {
      const property = await this.propertiesService.create(agent.id, body);
      return {
        status: 201,
        body: property,
      };
    });
  }

  @UseGuards(AgentAuthGuard)
  @TsRestHandler(contract.agent.properties.update)
  update(@AuthedAgent() agent: Agent) {
    return tsRestHandler(
      contract.agent.properties.update,
      async ({ params, body }) => {
        try {
          validateUuid(params.id);
          const property = await this.propertiesService.update(
            params.id,
            agent.id,
            body,
          );

          return {
            status: 200,
            body: property,
          };
        } catch (error) {
          if (error instanceof InvalidUUIDError) {
            throw new TsRestResponseError(contract.agent.properties.update, {
              status: 404,
              body: { message: 'Property not found' },
            });
          }

          if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new TsRestResponseError(contract.agent.properties.update, {
              status: 404,
              body: { message: 'Property not found' },
            });
          }

          throw new TsRestResponseError(contract.agent.properties.update, {
            status: 500,
            body: { message: 'Internal server error' },
          });
        }
      },
    );
  }

  @UseGuards(AgentAuthGuard)
  @TsRestHandler(contract.agent.properties.delete)
  delete(@AuthedAgent() agent: Agent) {
    return tsRestHandler(
      contract.agent.properties.delete,
      async ({ params }) => {
        try {
          validateUuid(params.id);
          await this.propertiesService.delete(params.id, agent.id);
          return {
            status: 204,
            body: null,
          };
        } catch (error) {
          if (error instanceof InvalidUUIDError) {
            throw new TsRestResponseError(contract.agent.properties.delete, {
              status: 404,
              body: { message: 'Property not found' },
            });
          }

          if (
            error instanceof PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new TsRestResponseError(contract.agent.properties.delete, {
              status: 404,
              body: { message: 'Property not found' },
            });
          }

          throw new TsRestResponseError(contract.agent.properties.delete, {
            status: 500,
            body: { message: 'Internal server error' },
          });
        }
      },
    );
  }
}
