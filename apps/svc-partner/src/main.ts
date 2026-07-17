import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { MicroserviceExceptionFilter } from '@kifcover/shared-types';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: { host: '0.0.0.0', port: Number(process.env.PORT) || 3004 },
  });
  app.useGlobalFilters(new MicroserviceExceptionFilter());
  await app.listen();
  console.log('🤝  Partner Service listening on port', process.env.PORT || 3004);
}
bootstrap();
