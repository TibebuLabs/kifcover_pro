import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ClaimsController } from './claims/claims.controller';
import { ClaimsService } from './claims/claims.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
})
export class AppModule {}
