import { Controller } from '@nestjs/common';
import { TsRest, TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PropertiesService } from './properties.service';
import { InquiriesService } from '../inquiries/inquiries.service';
import { contract } from '@properview/api-contract';
import { TsRestResponseError } from '@ts-rest/core';
import { InvalidUUIDError } from '../core/errors/InvalidUUID.error';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { validateUuid } from '../utils';

@Controller()
@TsRest({
    jsonQuery: true,
    validateResponses: true
})
export class PropertiesController {
    constructor(
        private readonly propertiesService: PropertiesService,
        private readonly inquiriesService: InquiriesService
    ) {}

    @TsRestHandler(contract.public.properties.list)
    list() {
        return tsRestHandler(contract.public.properties.list, async ({ query }) => {
            const properties = await this.propertiesService.paginate(
                query,
                query.page,
                query.limit
            );
            return {
                status: 200,
                body: properties
            };
        });
    }

    @TsRestHandler(contract.public.properties.get)
    get() {
        return tsRestHandler(contract.public.properties.get, async ({ params }) => {
            try {
                validateUuid(params.id)
                const property = await this.propertiesService.retrieveById(params.id);

                return {
                    status: 200,
                    body: property
                };
            } catch (error) {
                if (error instanceof InvalidUUIDError) {
                    throw new TsRestResponseError(contract.public.properties.get, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new TsRestResponseError(contract.public.properties.get, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                throw new TsRestResponseError(contract.public.properties.get, {
                    status: 500,
                    body: { message: 'Internal server error' }
                })
            }
        });
    }

    @TsRestHandler(contract.public.properties.view)
    view() {
        return tsRestHandler(contract.public.properties.view, async ({ params, headers }) => {
            let ipAddress = headers['cf-connecting-ip'] ?? headers['x-forwarded-for'] ?? '';

            if (Array.isArray(ipAddress)) {
                ipAddress = ipAddress[0];
            }

            try {
                validateUuid(params.id)

            await this.propertiesService.incrementView(params.id, ipAddress);
            return {
                status: 200,
                body: true
            };
            } catch (error) {
                if (error instanceof InvalidUUIDError) {
                    throw new TsRestResponseError(contract.public.properties.view, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new TsRestResponseError(contract.public.properties.view, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                throw new TsRestResponseError(contract.public.properties.view, {
                    status: 500,
                    body: { message: 'Internal server error' }
                })
            }
        });
    }

    @TsRestHandler(contract.public.properties.submitInquiry)
    submitInquiry() {
        return tsRestHandler(contract.public.properties.submitInquiry, async ({ body }) => {
            const inquiryData = body;

            try {
                validateUuid(inquiryData.propertyId)

                await this.inquiriesService.submitInquiry(inquiryData.propertyId, inquiryData);

                return {
                    status: 200,
                    body: {
                        message: 'Inquiry submitted successfully'
                    }
                };
            } catch (error) {
                if (error instanceof InvalidUUIDError) {
                    throw new TsRestResponseError(contract.public.properties.submitInquiry, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                    throw new TsRestResponseError(contract.public.properties.submitInquiry, {
                        status: 404,
                        body: { message: 'Property not found' }
                    })
                }

                throw new TsRestResponseError(contract.public.properties.submitInquiry, {
                    status: 500,
                    body: { message: 'Internal server error' }
                })
            }

        });
    }
}
