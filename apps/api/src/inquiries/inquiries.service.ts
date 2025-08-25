import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class InquiriesService {
    constructor(private readonly prisma: PrismaService) {}

    async submitInquiry(propertyId: string, inquiryData: { name: string; email: string; phone: string, message: string }) {
        const inquiry = await this.prisma.inquiry.create({
            data: {
                ...inquiryData,
                propertyId,
            }
        });

        return inquiry;
    }

    async paginateInquiries(agentId: string,page: number = 1, limit: number = 10, propertyId?: string) {
        const where: Prisma.InquiryWhereInput = {
            ...(propertyId && { propertyId }),
            property: {
                agentId: agentId
            }
        }

        const [inquiries, total] = await this.prisma.$transaction([
            this.prisma.inquiry.findMany({ where, skip: (page - 1) * limit, take: limit }),
            this.prisma.inquiry.count({ where }),
        ])

        return {
            data: inquiries,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            }
        }
    }
}
