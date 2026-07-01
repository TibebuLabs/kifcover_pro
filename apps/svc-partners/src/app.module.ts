import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { PartnersController } from './partners/partners.controller';
import { PartnersService } from './partners/partners.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class AppModule {}
