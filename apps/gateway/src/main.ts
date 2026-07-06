import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // ── Fail-fast config check ──────────────────────────────────────────────
  if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    process.env.JWT_SECRET = 'dev-secret-not-for-production';
    console.warn('⚠️  JWT_SECRET not set — using insecure default (dev only)');
  }

  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

  // ── Global prefix ───────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── CORS ────────────────────────────────────────────────────────────────
  const origins = (process.env.FRONTEND_URL || 'http://localhost:4000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
  });

  // ── Security headers ────────────────────────────────────────────────────
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // ── Validation ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger / OpenAPI ───────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('KifCover API')
    .setDescription(
      `## Embedded Insurance Infrastructure for Ethiopia

KifCover powers digital platforms to embed insurance seamlessly.
This gateway is the **single HTTP entry point** for all 10 microservices.

### Architecture
- **Gateway** → routes HTTP requests to microservices via NestJS TCP
- Each service has its **own PostgreSQL database**
- JWT authentication at the gateway layer

### Authentication
1. Register via \`POST /api/v1/auth/register\`
2. Login via \`POST /api/v1/auth/login\` → get \`accessToken\`
3. Click **Authorize** above and paste: \`Bearer <accessToken>\`

### Roles
| Role | Access |
|------|--------|
| \`CUSTOMER\` | Own policies, claims, KYC |
| \`PARTNER_ADMIN\` | Partner policies view |
| \`INSURANCE_PROVIDER\` | Claims review, analytics |
| \`PLATFORM_ADMIN\` | Full access |

### Demo Credentials
- **Admin:** \`admin@kifcover.et\` / \`Admin@kifcover2024\`
      `,
    )
    .setVersion('2.0.0')
    .setContact('KifCover Engineering', 'https://kifcover.et', 'api@kifcover.et')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.kifcover.et', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste your JWT access token here',
      },
      'bearer',
    )
    .addTag('🔐 Auth', 'Registration, login, token management')
    .addTag('👤 Users', 'User profiles and management')
    .addTag('📦 Products', 'Insurance product catalog')
    .addTag('💬 Quotes', 'Dynamic premium calculation engine')
    .addTag('📋 Policies', 'Policy issuance and lifecycle management')
    .addTag('🩺 Claims', 'Claims submission and processing workflow')
    .addTag('💳 Payments', 'Payment initiation and confirmation')
    .addTag('🪪 KYC', 'Identity verification and document management')
    .addTag('🤝 Partners', 'API partner registration and management')
    .addTag('📊 Analytics', 'Platform-wide KPIs and business intelligence')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,         // remembers token on page refresh
      docExpansion: 'list',               // expand tags, collapse endpoints
      filter: true,                       // search bar
      showRequestDuration: true,          // shows ms per request
      tryItOutEnabled: true,              // pre-enable "Try it out"
    },
    customSiteTitle: 'KifCover API Docs',
    customCss: `
      .swagger-ui .topbar { background: #002743; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
      .swagger-ui .info .title { color: #002743; font-size: 2rem; }
    `,
  });

  // ── Start ────────────────────────────────────────────────────────────────
  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  logger.log(`🌐 KifCover API Gateway  →  http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger Docs          →  http://localhost:${port}/api/docs`);
}

bootstrap();
