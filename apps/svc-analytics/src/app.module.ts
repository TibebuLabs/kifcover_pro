import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP as Transport.TCP,
        options: { host: process.env.SERVICE_HOST || 'localhost', port: Number(process.env.USERS_SVC_PORT) || 3002 },
      },
      {
        name: 'POLICIES_SERVICE',
        transport: Transport.TCP as Transport.TCP,
        options: { host: process.env.SERVICE_HOST || 'localhost', port: Number(process.env.POLICIES_SVC_PORT) || 3005 },
      },
      {
        name: 'CLAIMS_SERVICE',
        transport: Transport.TCP as Transport.TCP,
        options: { host: process.env.SERVICE_HOST || 'localhost', port: Number(process.env.CLAIMS_SVC_PORT) || 3006 },
      },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AppModule {}
