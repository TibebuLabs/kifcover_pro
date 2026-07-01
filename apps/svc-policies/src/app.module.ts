import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { PoliciesController } from './policies/policies.controller';
import { PoliciesService } from './policies/policies.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Connects back to users service to verify KYC
    ClientsModule.register([{
      name: 'USERS_SERVICE',
      transport: Transport.TCP,
      options: { host: process.env.SERVICE_HOST || 'localhost', port: Number(process.env.USERS_SVC_PORT) || 3002 },
    }]),
  ],
  controllers: [PoliciesController],
  providers: [PoliciesService],
})
export class AppModule {}
