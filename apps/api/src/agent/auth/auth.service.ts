import { Injectable } from '@nestjs/common';
import { contract } from '@properview/api-contract';
import { ServerInferRequest } from '@ts-rest/core';
import { TsRestException } from '@ts-rest/nest';
import { verify } from 'argon2';
import { AgentsService } from '../agents/agents.service';
import { Agent } from '@prisma/client';
import { JwtToken } from './jwtToken';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly jwtService: JwtService,
  ) {}
  async login(
    input: ServerInferRequest<typeof contract.agent.auth.login>['body'],
  ) {
    const user = await this.agentsService.retrieveByEmail(input.email);

    if (!user) {
      throw new TsRestException(contract.agent.auth.login, {
        status: 401,
        body: {
          message: 'Invalid email or password',
        },
      });
    }

    const isPasswordValid = await verify(user.password, input.password);

    if (!isPasswordValid) {
      throw new TsRestException(contract.agent.auth.login, {
        status: 401,
        body: {
          message: 'Invalid email or password',
        },
      });
    }

    return this.getJwtAndRefreshToken(user);
  }

  async validateToken(token: string) {
    try {
      const decodedJwtToken = this.jwtService.verify<JwtToken>(token);

      const user = await this.agentsService.retrieveByIdOrThrow(
        decodedJwtToken.id,
      );

      if (user.email !== decodedJwtToken.email) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }

  async getUserFromToken(token: string) {
    const decodedJwtToken = this.jwtService.verify<JwtToken>(token);

    return this.agentsService.retrieveByIdOrThrow(decodedJwtToken.id);
  }

  private getJwtAndRefreshToken(user: Agent) {
    const jwtToken: JwtToken = {
      email: user.email,
      id: user.id,
      name: user.name,
    };

    const token = this.jwtService.sign(jwtToken, {
      expiresIn: '60d',
    });

    return {
      token,
    };
  }
}
