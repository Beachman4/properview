import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AgentsService {
    constructor(private readonly prismaService: PrismaService) {}

    async retrieveByEmail(email: string) {
        return this.prismaService.agent.findUnique({
            where: {
                email,
            },
        })
    }

    async retrieveByIdOrThrow(id: string) {
        return this.prismaService.agent.findUniqueOrThrow({
            where: {
                id,
            },
        })
    }
}
