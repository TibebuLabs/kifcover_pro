import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesController } from './quotes/quotes.controller';
import { QuotesService } from './quotes/quotes.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule.register([{
      name: 'PRODUCTS_SERVICE',
      transport: Transport.TCP as Transport.TCP,
      options: {
        host: process.env.SERVICE_HOST || 'localhost',
        port: Number(process.env.PRODUCTS_SVC_PORT) || 3003,
      },
    }]),
  ],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class AppModule {}
