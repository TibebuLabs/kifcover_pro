import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { SERVICE_PORTS, SERVICE_HOST } from './config/services.config';
import { GatewayExceptionFilter } from './common/rpc-exception.filter';
import { JwtGatewayGuard } from './guards/jwt-gateway.guard';

import { AuthController } from './modules/auth/auth.controller';
import { UsersController } from './modules/users/users.controller';
import { ProductsController } from './modules/products/products.controller';
import { QuotesController } from './modules/quotes/quotes.controller';
import { PoliciesController } from './modules/policies/policies.controller';
import { ClaimsController } from './modules/claims/claims.controller';
import { PaymentsController } from './modules/payments/payments.controller';
import { KycController } from './modules/kyc/kyc.controller';
import { PartnersController } from './modules/partners/partners.controller';
import { AnalyticsController } from './modules/analytics/analytics.controller';

const makeTcpClient = (name: string, port: number) => ({
  name,
  transport: Transport.TCP as Transport.TCP,
  options: { host: SERVICE_HOST, port },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    ClientsModule.register([
      makeTcpClient('AUTH_SERVICE',      SERVICE_PORTS.AUTH),
      makeTcpClient('USERS_SERVICE',     SERVICE_PORTS.USERS),
      makeTcpClient('PRODUCTS_SERVICE',  SERVICE_PORTS.PRODUCTS),
      makeTcpClient('QUOTES_SERVICE',    SERVICE_PORTS.QUOTES),
      makeTcpClient('POLICIES_SERVICE',  SERVICE_PORTS.POLICIES),
      makeTcpClient('CLAIMS_SERVICE',    SERVICE_PORTS.CLAIMS),
      makeTcpClient('PAYMENTS_SERVICE',  SERVICE_PORTS.PAYMENTS),
      makeTcpClient('KYC_SERVICE',       SERVICE_PORTS.KYC),
      makeTcpClient('PARTNERS_SERVICE',  SERVICE_PORTS.PARTNERS),
      makeTcpClient('ANALYTICS_SERVICE', SERVICE_PORTS.ANALYTICS),
    ]),
  ],
  controllers: [
    AuthController,
    UsersController,
    ProductsController,
    QuotesController,
    PoliciesController,
    ClaimsController,
    PaymentsController,
    KycController,
    PartnersController,
    AnalyticsController,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GatewayExceptionFilter },
    { provide: APP_GUARD,  useClass: JwtGatewayGuard },
  ],
})
export class AppModule {}
