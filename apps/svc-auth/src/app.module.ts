import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET') || 'dev-secret-not-for-production',
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN') || '7d' },
      }),
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
