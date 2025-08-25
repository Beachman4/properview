import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  console.log('Listening on port', process.env.APP_PORT ?? 3000);
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
