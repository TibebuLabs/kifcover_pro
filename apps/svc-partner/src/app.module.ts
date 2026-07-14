import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { PartnerController } from './partner/partner.controller';
import { PartnerService } from './partner/partner.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'CUSTOMER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SERVICE_HOST || 'localhost',
          port: Number(process.env.CUSTOMER_SVC_PORT) || 3002,
        },
      },
    ]),
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
})
export class AppModule {}
