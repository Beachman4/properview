import { Module } from '@nestjs/common';
import { MapboxService } from './mapbox.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import mbxClient from '@mapbox/mapbox-sdk/lib/node/node-client.js';

@Module({
  imports: [ConfigModule],
  providers: [
    MapboxService,
    {
      provide: 'mapbox',
      useFactory: (configService: ConfigService) => {
        return mbxClient({
          accessToken: configService.getOrThrow<string>('mapbox.accessToken'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MapboxService],
})
export class MapboxModule {}
