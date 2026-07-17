import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

const tcp = (name: string, portEnv: string, defaultPort: number) => ({
  name,
  transport: Transport.TCP as Transport.TCP,
  options: {
    host: process.env.SERVICE_HOST || 'localhost',
    port: Number(process.env[portEnv]) || defaultPort,
  },
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([
      tcp('CUSTOMER_SERVICE', 'CUSTOMER_SVC_PORT', 3002),
      tcp('PARTNER_SERVICE',  'PARTNER_SVC_PORT',  3004),
      tcp('INSURER_SERVICE',  'INSURER_SVC_PORT',  3003),
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AppModule {}
