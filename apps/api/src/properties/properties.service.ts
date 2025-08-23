import { Injectable } from '@nestjs/common';
import { Prisma, PropertyStatus } from '@prisma/client';
import { contract } from '@properview/api-contract';
import { ServerInferRequest, ServerInferResponseBody } from '@ts-rest/core';
import { MapboxService } from 'src/mapbox/mapbox.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PropertiesService {
    constructor(private readonly prisma: PrismaService, private readonly mapboxService: MapboxService) {}

    async paginate(queryParams: Exclude<ServerInferRequest<typeof contract.public.properties.list>["query"], "page" | "limit">, page: number = 1, limit: number = 10): Promise<ServerInferResponseBody<typeof contract.public.properties.list, 200>> {
        const where: Prisma.PropertyWhereInput = {
            status: PropertyStatus.active,
            ...(queryParams.bedroomsMin && { bedrooms: { gte: queryParams.bedroomsMin } }),
            ...(queryParams.bedroomsMax && { bedrooms: { lte: queryParams.bedroomsMax } }),
            ...(queryParams.bathroomsMin && { bathrooms: { gte: queryParams.bathroomsMin } }),
            ...(queryParams.bathroomsMax && { bathrooms: { lte: queryParams.bathroomsMax } }),
            ...(queryParams.priceMin && { price: { gte: queryParams.priceMin } }),
            ...(queryParams.priceMax && { price: { lte: queryParams.priceMax } }),
        }

        if (queryParams.location) {
            const coordinates = await this.mapboxService.getCoordinates(queryParams.location);
            const [longitude, latitude] = coordinates;
            
            // Use raw SQL with Haversine formula for precise distance calculation within 50 miles
            const propertiesWithDistance = await this.prisma.$queryRaw<Array<any & { distance_miles: number }>>`
                SELECT 
                    p.*,
                    (3959 * acos(cos(radians(${latitude})) * cos(radians(p."addressLatitude")) * 
                     cos(radians(p."addressLongitude") - radians(${longitude})) + 
                     sin(radians(${latitude})) * sin(radians(p."addressLatitude")))) as distance_miles
                FROM "Property" p
                WHERE p.status = 'active'
                ${queryParams.bedroomsMin ? `AND p.bedrooms >= ${queryParams.bedroomsMin}` : ''}
                ${queryParams.bedroomsMax ? `AND p.bedrooms <= ${queryParams.bedroomsMax}` : ''}
                ${queryParams.bathroomsMin ? `AND p.bathrooms >= ${queryParams.bathroomsMin}` : ''}
                ${queryParams.bathroomsMax ? `AND p.bathrooms <= ${queryParams.bathroomsMax}` : ''}
                ${queryParams.priceMin ? `AND p.price >= ${queryParams.priceMin}` : ''}
                ${queryParams.priceMax ? `AND p.price <= ${queryParams.priceMax}` : ''}
                AND (3959 * acos(cos(radians(${latitude})) * cos(radians(p."addressLatitude")) * 
                     cos(radians(p."addressLongitude") - radians(${longitude})) + 
                     sin(radians(${latitude})) * sin(radians(p."addressLatitude")))) <= 50
                ORDER BY distance_miles ASC
                LIMIT ${limit}
                OFFSET ${(page - 1) * limit}
            `;
            
            const totalWithDistance = await this.prisma.$queryRaw<Array<{ total: bigint }>>`
                SELECT COUNT(*) as total
                FROM "Property" p
                WHERE p.status = 'active'
                ${queryParams.bedroomsMin ? `AND p.bedrooms >= ${queryParams.bedroomsMin}` : ''}
                ${queryParams.bedroomsMax ? `AND p.bedrooms <= ${queryParams.bedroomsMax}` : ''}
                ${queryParams.bathroomsMin ? `AND p.bathrooms >= ${queryParams.bathroomsMin}` : ''}
                ${queryParams.bathroomsMax ? `AND p.bathrooms <= ${queryParams.bathroomsMax}` : ''}
                ${queryParams.priceMin ? `AND p.price >= ${queryParams.priceMin}` : ''}
                ${queryParams.priceMax ? `AND p.price <= ${queryParams.priceMax}` : ''}
                AND (3959 * acos(cos(radians(${latitude})) * cos(radians(p."addressLatitude")) * 
                     cos(radians(p."addressLongitude") - radians(${longitude})) + 
                     sin(radians(${latitude})) * sin(radians(p."addressLatitude")))) <= 50
            `;
            
            const total = Number(totalWithDistance[0].total);
            
            return {
                data: propertiesWithDistance,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1,
                }
            };
        }

        const orderBy: Prisma.PropertyOrderByWithRelationInput = {
            ...(queryParams.sortBy === 'price' && { price: queryParams.sortOrder }),
            ...(queryParams.sortBy === 'createdAt' && { createdAt: queryParams.sortOrder }),
            ...(!queryParams.sortBy && { createdAt: queryParams.sortOrder }),
        }

        const [ properties, total ] = await this.prisma.$transaction([
            this.prisma.property.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy,
            }),
            this.prisma.property.count({
                where
            })
        ])

        return {
            data: properties,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        }
    }

    async paginateByAgentId(agentId: string, page: number = 1, limit: number = 10): Promise<ServerInferResponseBody<typeof contract.agent.properties.list, 200>> {
        const [ properties, total ] = await this.prisma.$transaction([
            this.prisma.property.findMany({
                where: {
                    agentId
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prisma.property.count({
                where: {
                    agentId
                }
            })
        ])

        return {
            data: properties,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1,
            }
        }
    }

    async retrieveById(id: string) {
        return this.prisma.property.findUniqueOrThrow({
            where: {
                id
            }
        })
    }

    async retrieveByIdAndAgentId(id: string, agentId: string) {
        return this.prisma.property.findUniqueOrThrow({
            where: {
                id,
                agentId
            }
        })
    }

    async create(agentId: string, data: ServerInferRequest<typeof contract.agent.properties.create>["body"]) {
        const coordinates = await this.mapboxService.getCoordinates(data.address);
        const [longitude, latitude] = coordinates;

        return this.prisma.property.create({
            data: {
                ...data,
                agentId,
                addressLongitude: longitude,
                addressLatitude: latitude
            }
        })
    }

    async update(id: string, data: ServerInferRequest<typeof contract.agent.properties.update>["body"]) {
        const currentProperty = await this.prisma.property.findUniqueOrThrow({
            where: {
                id
            }
        })

        const updateData: Prisma.PropertyUpdateInput = {
            ...data
        }

        if (data.address !== currentProperty.address) {
            const coordinates = await this.mapboxService.getCoordinates(data.address);
            const [longitude, latitude] = coordinates;
            updateData.addressLongitude = longitude;
            updateData.addressLatitude = latitude;
        }

        
        return this.prisma.property.update({
            where: {
                id
            },
            data: updateData
        })
    }

    async delete(id: string) {
        return this.prisma.property.delete({
            where: {
                id
            }
        })
    }
}
