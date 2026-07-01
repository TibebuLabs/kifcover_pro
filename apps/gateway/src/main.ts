import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // Fail fast — don't start with a weak default secret in production
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    process.env.JWT_SECRET = 'dev-secret-not-for-production';
    console.warn('⚠️  JWT_SECRET not set — using insecure default (dev only)');
  }
  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

  app.setGlobalPrefix('api/v1');

  const origins = (process.env.FRONTEND_URL || 'http://localhost:4000').split(',').map(o => o.trim());
  app.enableCors({ origin: origins, credentials: true, methods: ['GET','POST','PATCH','PUT','DELETE','OPTIONS'] });

  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('KifCover API Gateway')
    .setDescription('Single entry point for all KifCover microservices')
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('Auth').addTag('Users').addTag('Products').addTag('Quotes')
    .addTag('Policies').addTag('Claims').addTag('Payments').addTag('KYC')
    .addTag('Partners').addTag('Analytics')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  logger.log(`🌐 API Gateway running on http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
