import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminInitializerService } from './admin-initializer.service';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
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

  controllers: [AdminController],
  providers: [AdminService, AdminInitializerService],
})
export class AdminModule {}
