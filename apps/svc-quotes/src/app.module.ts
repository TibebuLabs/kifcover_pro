import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QuotesController } from './quotes/quotes.controller';
import { QuotesService } from './quotes/quotes.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [QuotesController],
  providers: [QuotesService],
})
export class AppModule {}
