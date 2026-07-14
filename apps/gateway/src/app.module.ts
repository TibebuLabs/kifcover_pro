import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { SERVICE_PORTS, SERVICE_HOST } from './config/services.config';
import { GatewayExceptionFilter } from './common/rpc-exception.filter';
import { JwtGatewayGuard } from './guards/jwt-gateway.guard';

// Controllers
import { AuthController }     from './modules/auth/auth.controller';
import { CustomerController } from './modules/customer/customer.controller';
import { InsurerController }  from './modules/insurer/insurer.controller';
import { PartnerController }  from './modules/partner/partner.controller';
import { AdminController }    from './modules/admin/admin.controller';

const tcp = (name: string, port: number) => ({
  name,
  transport: Transport.TCP as Transport.TCP,
  options: { host: SERVICE_HOST, port },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-not-for-production',
      signOptions: { expiresIn: '7d' },
    }),
    ClientsModule.register([
      tcp('AUTH_SERVICE',     SERVICE_PORTS.AUTH),
      tcp('CUSTOMER_SERVICE', SERVICE_PORTS.CUSTOMER),
      tcp('INSURER_SERVICE',  SERVICE_PORTS.INSURER),
      tcp('PARTNER_SERVICE',  SERVICE_PORTS.PARTNER),
      tcp('ADMIN_SERVICE',    SERVICE_PORTS.ADMIN),
    ]),
  ],
  controllers: [
    AuthController,
    CustomerController,
    InsurerController,
    PartnerController,
    AdminController,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GatewayExceptionFilter },
    { provide: APP_GUARD,  useClass: JwtGatewayGuard },
  ],
})
export class AppModule {}
