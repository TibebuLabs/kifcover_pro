import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { InsurerController } from './insurer/insurer.controller';
import { InsurerService } from './insurer/insurer.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
  ],
  controllers: [InsurerController],
  providers: [InsurerService],
})
export class AppModule {}
