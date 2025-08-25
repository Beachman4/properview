import { Controller } from '@nestjs/common';
import { TsRest, tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { AuthService } from './auth.service';
import { contract } from '@properview/api-contract';

@Controller()
@TsRest({
    jsonQuery: true,
    validateResponses: true
})
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @TsRestHandler(contract.agent.auth.login)
    login() {
        return tsRestHandler(contract.agent.auth.login, async ({ body }) => {
            const resp = await this.authService.login(body);
            return {
                status: 200,
                body: resp
            }
        })
    }

    @TsRestHandler(contract.agent.auth.validateToken)
    validateToken() {
        return tsRestHandler(contract.agent.auth.validateToken, async ({ headers }) => {
            const resp = await this.authService.validateToken(headers.authorization);
            return {
                status: 200,
                body: resp
            }
        })
    }
}
