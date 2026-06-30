import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Module({
  imports: [
    PrismaModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<StringValue>('jwt.expiresIn'),
        },
      }),
    }),
  ],

  providers: [AuthService],

  controllers: [AuthController],
})
export class AuthModule {}
