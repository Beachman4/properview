import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from './properties.service';
import { createTestingModuleFactory } from 'nest-spectator';
import { PrismaService } from '../prisma/prisma.service';
import { MapboxService } from '../mapbox/mapbox.service';
import { PropertyStatus, Property } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { contract } from '@properview/api-contract';
import { ServerInferRequest } from '@ts-rest/core';

type PaginateQueryParams = {
  sortOrder: 'asc' | 'desc';
  sortBy?: string;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;
  bathroomsMax?: number;
  priceMin?: number;
  priceMax?: number;
  location?: string;
};

describe('PropertiesService', () => {
  let service: PropertiesService;
  let prismaService: any;
  let mapboxService: jest.Mocked<MapboxService>;

  const mockProperty: Property = {
    id: 'property-1',
    title: 'Beautiful House',
    price: 500000,
    address: '123 Main St',
    addressLongitude: -74.006,
    addressLatitude: 40.7128,
    bedrooms: 3,
    bathrooms: 2,
    description: 'A beautiful house',
    status: PropertyStatus.active,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    views: 100,
    agentId: 'agent-1',
  };

  const mockPropertyWithInquiries = {
    ...mockProperty,
    _count: {
      inquiries: 5,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await createTestingModuleFactory({
      providers: [
        PropertiesService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            $queryRaw: jest.fn(),
            property: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
      mocks: [MapboxService],
    }).compile();

    service = module.get<PropertiesService>(PropertiesService);
    prismaService = module.get(PrismaService);
    mapboxService = module.get(MapboxService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('paginate', () => {
    describe('without location filtering', () => {
      it('should paginate properties with basic filters', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          bedroomsMin: 2,
          bedroomsMax: 4,
          priceMin: 200000,
          priceMax: 600000,
          sortBy: 'price',
          sortOrder: 'asc',
        };
        const expectedProperties = [mockProperty];
        const expectedTotal = 1;

        prismaService.$transaction.mockImplementation(async (queries) => {
          // Simulate executing the queries
          const findManyResult = expectedProperties;
          const countResult = expectedTotal;
          return [findManyResult, countResult];
        });

        // Act
        const result = await service.paginate(queryParams as any, 1, 10);

        // Assert
        expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

        expect(result).toEqual({
          data: expectedProperties,
          meta: {
            total: expectedTotal,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        });
      });

      it('should handle bathroom filters', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          bathroomsMin: 1,
          bathroomsMax: 3,
          sortOrder: 'desc',
        };
        prismaService.$transaction.mockImplementation(async (queries) => {
          return [[], 0];
        });

        // Act
        await service.paginate(queryParams as any, 1, 10);

        // Assert
        expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
      });

      it('should handle default sorting when no sortBy is provided', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          sortOrder: 'desc',
        };
        prismaService.$transaction.mockImplementation(async (queries) => {
          return [[], 0];
        });

        // Act
        await service.paginate(queryParams as any, 1, 10);

        // Assert
        expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
      });

      it('should calculate pagination metadata correctly', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          sortOrder: 'desc',
        };
        prismaService.$transaction.mockImplementation(async (queries) => {
          return [[], 25];
        });

        // Act
        const result = await service.paginate(queryParams as any, 2, 10);

        // Assert
        expect(result.meta).toEqual({
          total: 25,
          page: 2,
          limit: 10,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        });
      });
    });

    describe('with location filtering', () => {
      it('should use distance-based queries when location is provided', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          location: 'New York, NY',
          priceMin: 300000,
          sortOrder: 'desc',
        };
        const mockCoordinates: [number, number] = [-74.006, 40.7128];
        const mockPropertiesWithDistance = [
          { ...mockProperty, distance_miles: 2.5 },
        ];
        const mockTotal = [{ total: BigInt(1) }];

        mapboxService.getCoordinates.mockResolvedValue(mockCoordinates);
        prismaService.$queryRaw
          .mockResolvedValueOnce(mockPropertiesWithDistance)
          .mockResolvedValueOnce(mockTotal);

        // Act
        const result = await service.paginate(queryParams as any, 1, 10);

        // Assert
        expect(mapboxService.getCoordinates).toHaveBeenCalledWith(
          'New York, NY',
        );
        expect(prismaService.$queryRaw).toHaveBeenCalledTimes(2);

        // Verify the distance query is called
        expect(prismaService.$queryRaw).toHaveBeenCalledWith(
          expect.objectContaining({
            strings: expect.arrayContaining([
              expect.stringContaining('distance_miles'),
            ]),
          }),
        );

        expect(result).toEqual({
          data: mockPropertiesWithDistance,
          meta: {
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        });
      });

      it('should include all filter conditions in distance query', async () => {
        // Arrange
        const queryParams: PaginateQueryParams = {
          location: 'Boston, MA',
          bedroomsMin: 2,
          bedroomsMax: 4,
          bathroomsMin: 1,
          bathroomsMax: 3,
          priceMin: 200000,
          priceMax: 800000,
          sortOrder: 'desc',
        };
        const mockCoordinates: [number, number] = [-71.0589, 42.3601];

        mapboxService.getCoordinates.mockResolvedValue(mockCoordinates);
        prismaService.$queryRaw
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ total: BigInt(0) }]);

        // Act
        await service.paginate(queryParams as any, 1, 10);

        // Assert
        expect(mapboxService.getCoordinates).toHaveBeenCalledWith('Boston, MA');
        expect(prismaService.$queryRaw).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('incrementView', () => {
    it('should increment view when not cached', async () => {
      // Arrange
      const propertyId = 'property-1';
      const ipAddress = '192.168.1.1';
      const updatedProperty = { ...mockProperty, views: 101 };

      prismaService.property.update.mockResolvedValue(updatedProperty);

      // Act
      const result = await service.incrementView(propertyId, ipAddress);

      // Assert
      expect(prismaService.property.update).toHaveBeenCalledWith({
        where: { id: propertyId },
        data: { views: { increment: 1 } },
      });
      expect(result).toBe(updatedProperty);
    });

    it('should not increment view when cached', async () => {
      // Arrange
      const propertyId = 'property-1';
      const ipAddress = '192.168.1.1';

      // Simulate cache hit by calling incrementView first
      await service.incrementView(propertyId, ipAddress);
      jest.clearAllMocks();

      // Act
      const result = await service.incrementView(propertyId, ipAddress);

      // Assert
      expect(prismaService.property.update).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should allow different IP addresses to increment views', async () => {
      // Arrange
      const propertyId = 'property-1';
      const ipAddress1 = '192.168.1.1';
      const ipAddress2 = '192.168.1.2';
      const updatedProperty = { ...mockProperty, views: 101 };

      prismaService.property.update.mockResolvedValue(updatedProperty);

      // Act
      await service.incrementView(propertyId, ipAddress1);
      await service.incrementView(propertyId, ipAddress2);

      // Assert
      expect(prismaService.property.update).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    const propertyId = 'property-1';
    const agentId = 'agent-1';

    it('should update property without changing coordinates when address is same', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Title',
        price: 600000,
        address: '123 Main St', // Same address
        bedrooms: 4,
        bathrooms: 3,
        description: 'Updated description',
        status: PropertyStatus.active,
      };

      prismaService.property.findUniqueOrThrow.mockResolvedValue(mockProperty);
      prismaService.property.update.mockResolvedValue(
        mockPropertyWithInquiries,
      );

      // Act
      const result = await service.update(propertyId, agentId, updateData);

      // Assert
      expect(prismaService.property.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: propertyId, agentId },
      });

      expect(mapboxService.getCoordinates).not.toHaveBeenCalled();

      expect(prismaService.property.update).toHaveBeenCalledWith({
        where: { id: propertyId },
        include: {
          _count: {
            select: { inquiries: true },
          },
        },
        data: updateData,
      });

      expect(result).toEqual({
        ...mockPropertyWithInquiries,
        inquiries: 5,
        conversionRate: 0.05, // 5 inquiries / 100 views
      });
    });

    it('should fetch new coordinates when address changes', async () => {
      // Arrange
      const updateData = {
        title: 'Updated Title',
        address: '456 New Street', // Different address
        price: 600000,
        bedrooms: 4,
        bathrooms: 3,
        description: 'Updated description',
        status: PropertyStatus.active,
      };
      const newCoordinates: [number, number] = [-73.935, 40.73];

      prismaService.property.findUniqueOrThrow.mockResolvedValue(mockProperty);
      mapboxService.getCoordinates.mockResolvedValue(newCoordinates);
      prismaService.property.update.mockResolvedValue(
        mockPropertyWithInquiries,
      );

      // Act
      const result = await service.update(propertyId, agentId, updateData);

      // Assert
      expect(mapboxService.getCoordinates).toHaveBeenCalledWith(
        '456 New Street',
      );

      expect(prismaService.property.update).toHaveBeenCalledWith({
        where: { id: propertyId },
        include: {
          _count: {
            select: { inquiries: true },
          },
        },
        data: {
          ...updateData,
          addressLongitude: -73.935,
          addressLatitude: 40.73,
        },
      });

      expect(result).toEqual({
        ...mockPropertyWithInquiries,
        inquiries: 5,
        conversionRate: 0.05,
      });
    });
  });

  describe('private helper methods', () => {
    describe('calculateConversionRate', () => {
      it('should calculate conversion rate correctly', () => {
        // Arrange
        const property = { ...mockProperty, views: 100 };
        const inquiries = 5;

        // Act
        const result = (service as any).calculateConversionRate(
          property,
          inquiries,
        );

        // Assert
        expect(result).toBe(0.05); // 5/100 = 0.05
      });

      it('should return 0 when views is 0', () => {
        // Arrange
        const property = { ...mockProperty, views: 0 };
        const inquiries = 5;

        // Act
        const result = (service as any).calculateConversionRate(
          property,
          inquiries,
        );

        // Assert
        expect(result).toBe(0);
      });

      it('should return 0 when inquiries is 0', () => {
        // Arrange
        const property = { ...mockProperty, views: 100 };
        const inquiries = 0;

        // Act
        const result = (service as any).calculateConversionRate(
          property,
          inquiries,
        );

        // Assert
        expect(result).toBe(0);
      });

      it('should return 0 when both views and inquiries are 0', () => {
        // Arrange
        const property = { ...mockProperty, views: 0 };
        const inquiries = 0;

        // Act
        const result = (service as any).calculateConversionRate(
          property,
          inquiries,
        );

        // Assert
        expect(result).toBe(0);
      });
    });

    describe('hydrateProperty', () => {
      it('should hydrate property with inquiries and conversion rate', () => {
        // Arrange
        const property = { ...mockProperty, views: 100 };
        const inquiries = 10;

        // Act
        const result = (service as any).hydrateProperty(property, inquiries);

        // Assert
        expect(result).toEqual({
          ...property,
          inquiries: 10,
          conversionRate: 0.1, // 10/100 = 0.1
        });
      });

      it('should hydrate property with zero conversion rate when no views', () => {
        // Arrange
        const property = { ...mockProperty, views: 0 };
        const inquiries = 5;

        // Act
        const result = (service as any).hydrateProperty(property, inquiries);

        // Assert
        expect(result).toEqual({
          ...property,
          inquiries: 5,
          conversionRate: 0,
        });
      });
    });
  });
});
