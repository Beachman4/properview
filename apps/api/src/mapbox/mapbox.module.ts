import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import MapiClient from '@mapbox/mapbox-sdk/lib/classes/mapi-client';
import { ConfigService } from '@nestjs/config';
import createNodeClient from '@mapbox/mapbox-sdk';

@Module({
  providers: [
    MapboxService,
    {
      provide: MapiClient,
      useFactory: (configService: ConfigService) => {
        return createNodeClient({
          accessToken: configService.getOrThrow<string>('mapbox.accessToken'),
        })
      },
      inject: [ConfigService]
    }
  ],
  exports: [MapboxService]
})
export class MapboxModule {}
