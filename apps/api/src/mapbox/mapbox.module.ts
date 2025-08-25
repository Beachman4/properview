import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import MapiClient from '@mapbox/mapbox-sdk/lib/classes/mapi-client';

@Module({
  imports: [
    ConfigModule
  ],
  providers: [
    MapboxService,
    {
      provide: 'mapbox',
      useFactory: (configService: ConfigService) => {
        return new MapiClient({
          accessToken: configService.getOrThrow<string>('mapbox.accessToken'),
        })
      },
      inject: [ConfigService]
    }
  ],
  exports: [MapboxService]
})
export class MapboxModule {}
