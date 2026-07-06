import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { ClaimsController } from './claims/claims.controller';
import { ClaimsService } from './claims/claims.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([{
      name: 'POLICIES_SERVICE',
      transport: Transport.TCP as Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || 'localhost',
        port: Number(process.env.POLICIES_SVC_PORT) || 3005,
      },
    }]),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class AppModule {}
