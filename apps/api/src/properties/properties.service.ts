import { Injectable } from '@nestjs/common';
import { Inquiry, Prisma, Property, PropertyStatus } from '@prisma/client';
import { AgentProperty, contract } from '@properview/api-contract';
import { ServerInferRequest, ServerInferResponseBody } from '@ts-rest/core';
import { MapboxService } from '../mapbox/mapbox.service';
import { PrismaService } from '../prisma/prisma.service';
import NodeCache from 'node-cache';

@Injectable()
export class PropertiesService {
    constructor(private readonly prisma: PrismaService, private readonly mapboxService: MapboxService) {}

    private readonly cache = new NodeCache({ stdTTL: 60 * 5 });

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
            
            // Build dynamic WHERE conditions using Prisma.sql
            let whereConditions = [Prisma.sql`p.status = 'active'`];
            
            if (queryParams.bedroomsMin) {
                whereConditions.push(Prisma.sql`p.bedrooms >= ${queryParams.bedroomsMin}`);
            }
            if (queryParams.bedroomsMax) {
                whereConditions.push(Prisma.sql`p.bedrooms <= ${queryParams.bedroomsMax}`);
            }
            if (queryParams.bathroomsMin) {
                whereConditions.push(Prisma.sql`p.bathrooms >= ${queryParams.bathroomsMin}`);
            }
            if (queryParams.bathroomsMax) {
                whereConditions.push(Prisma.sql`p.bathrooms <= ${queryParams.bathroomsMax}`);
            }
            if (queryParams.priceMin) {
                whereConditions.push(Prisma.sql`p.price >= ${queryParams.priceMin}`);
            }
            if (queryParams.priceMax) {
                whereConditions.push(Prisma.sql`p.price <= ${queryParams.priceMax}`);
            }
            
            // Add distance condition (within 10 miles)
            whereConditions.push(Prisma.sql`(3959 * acos(cos(radians(${latitude})) * cos(radians(p."addressLatitude")) * 
                cos(radians(p."addressLongitude") - radians(${longitude})) + 
                sin(radians(${latitude})) * sin(radians(p."addressLatitude")))) <= 10`);
            
            // Combine WHERE conditions
            const whereClause = Prisma.join(whereConditions, ' AND ');
            
            // Use raw SQL with Haversine formula for precise distance calculation within 10 miles
            const propertiesWithDistance = await this.prisma.$queryRaw<Array<any & { distance_miles: number }>>(
                Prisma.sql`
                    SELECT 
                        p.*,
                        (3959 * acos(cos(radians(${latitude})) * cos(radians(p."addressLatitude")) * 
                         cos(radians(p."addressLongitude") - radians(${longitude})) + 
                         sin(radians(${latitude})) * sin(radians(p."addressLatitude")))) as distance_miles
                    FROM "Property" p
                    WHERE ${whereClause}
                    ORDER BY distance_miles ASC
                    LIMIT ${limit}
                    OFFSET ${(page - 1) * limit}
                `
            );
            
            // Count query with same conditions
            const totalWithDistance = await this.prisma.$queryRaw<Array<{ total: bigint }>>(
                Prisma.sql`
                    SELECT COUNT(*) as total
                    FROM "Property" p
                    WHERE ${whereClause}
                `
            );
            
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
            ...(queryParams.sortBy === 'bedrooms' && { bedrooms: queryParams.sortOrder }),
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
                include: {
                    _count: {
                        select: {
                            inquiries: true
                        }
                    }
                },
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
            data: properties.map(property => this.hydrateProperty(property, property._count.inquiries)),
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

    async incrementView(id: string, ipAddress: string) {

        if (this.cache.get(`view-${id}-${ipAddress}`)) {
            return
        }

        this.cache.set(`view-${id}-${ipAddress}`, true);

        return this.prisma.property.update({
            where: {
                id
            },
            data: {
                views: { increment: 1 }
            }
        })
    }

    async retrieveByIdAndAgentId(id: string, agentId: string) {
        return this.prisma.property.findUniqueOrThrow({
            where: {
                id,
                agentId
            },
            include: {
                _count: {
                    select: {
                        inquiries: true
                    }
                }
            }
        }).then(property => this.hydrateProperty(property, property._count.inquiries))
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
        }).then(property => this.hydrateProperty(property, 0))
    }

    async update(id: string, agentId: string, data: ServerInferRequest<typeof contract.agent.properties.update>["body"]) {
        const currentProperty = await this.prisma.property.findUniqueOrThrow({
            where: {
                id,
                agentId
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
            include: {
                _count: {
                    select: {
                        inquiries: true
                    }
                }
            },
            data: updateData
        }).then(property => this.hydrateProperty(property, property._count.inquiries))
    }

    async delete(id: string, agentId: string) {
        const property = await this.prisma.property.findUniqueOrThrow({
            where: {
                id,
                agentId
            }
        })

        return this.prisma.property.delete({
            where: {
                id,
                agentId
            }
        })
    }

    private calculateConversionRate(property: Property, totalInquiries: number) {
        if (property.views === 0 || totalInquiries === 0) {
            return 0
        }
        return totalInquiries / property.views
    }

    private hydrateProperty(property: Property, totalInquiries: number): AgentProperty {
        return {
            ...property,
            inquiries: totalInquiries,
            conversionRate: this.calculateConversionRate(property, totalInquiries)
        }
    }
}
