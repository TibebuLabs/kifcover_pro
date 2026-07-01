import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { KycController } from './kyc/kyc.controller';
import { KycService } from './kyc/kyc.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  controllers: [KycController],
  providers: [KycService],
})
export class AppModule {}
