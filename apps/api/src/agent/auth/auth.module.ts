import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AgentsModule } from '../agents/agents.module';
import { AgentAuthGuard } from './agent-auth.guard';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: configService.get("JWT_SECRET"),
      global: true,
      signOptions: { expiresIn: "60d" },
    }),
  }), AgentsModule],
  providers: [AuthService, AgentAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, AgentAuthGuard]
})
export class AuthModule {}
