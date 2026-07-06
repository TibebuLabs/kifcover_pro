import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { KycController } from './kyc/kyc.controller';
import { KycService } from './kyc/kyc.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([{
      name: 'USERS_SERVICE',
      transport: Transport.TCP as Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || 'localhost',
        port: Number(process.env.USERS_SVC_PORT) || 3002,
      },
    }]),
  ],
  controllers: [KycController],
  providers: [KycService],
})
export class AppModule {}
