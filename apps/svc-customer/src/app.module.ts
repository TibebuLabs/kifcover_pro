import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { CustomerController } from './customer/customer.controller';
import { CustomerService } from './customer/customer.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'INSURER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SERVICE_HOST || 'localhost',
          port: Number(process.env.INSURER_SVC_PORT) || 3003,
        },
      },
      {
        name: 'PARTNER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SERVICE_HOST || 'localhost',
          port: Number(process.env.PARTNER_SVC_PORT) || 3004,
        },
      },
    ]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService],
})
export class AppModule {}
