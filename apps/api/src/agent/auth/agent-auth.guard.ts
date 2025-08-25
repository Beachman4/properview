import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { CanActivate } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authorization = this.getToken(context);

    if (!authorization || !this.authService.validateToken(authorization)) {
      throw new UnauthorizedException();
    }

    const user = await this.authService.getUserFromToken(authorization);

    context.switchToHttp().getRequest().agent = user;

    return true;
  }

  getToken(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.headers.authorization?.replace('Bearer ', '');
  }
}
