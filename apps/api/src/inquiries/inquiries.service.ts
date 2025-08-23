import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
    constructor(private readonly prisma: PrismaService) {}

    async submitInquiry(propertyId: string, inquiryData: { name: string; email: string; phone: string }) {
        const inquiry = await this.prisma.inquiry.create({
            data: {
                ...inquiryData,
                propertyId,
            }
        });

        return inquiry;
    }
}
