import MapiClient from '@mapbox/mapbox-sdk/lib/classes/mapi-client';
import GeocodingV6 from '@mapbox/mapbox-sdk/services/geocoding-v6';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class MapboxService {
    constructor(@Inject('mapbox') private readonly mapboxClient: MapiClient) {}

    async getCoordinates(addressOrLocation: string) {
        const geocodingService = GeocodingV6(this.mapboxClient);
        const { body } = await geocodingService.forwardGeocode({
            query: addressOrLocation,
            limit: 1,
        }).send()

        return body.features[0].geometry.coordinates;
    }
}
