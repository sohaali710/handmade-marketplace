import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SellerModule } from './seller/seller.module';
import { envValidationSchema } from './common/config/env.validation';
import { CategoryModule } from './category/category.module';
import envConfig from './common/config/env.config';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ProductModule } from './product/product.module';
import redisConfig from './common/redis/redis.config';
import { RedisModule } from './common/redis/redis.module';
import { CloudinaryModule } from './common/utils/cloudinary/cloudinary.module';

@Module({
  imports: [
    PrismaModule,

    RedisModule,

    CloudinaryModule,

    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.development.env'
          : '.production.env',

      isGlobal: true,
      load: [envConfig, redisConfig],
      validationSchema: envValidationSchema,
    }),

    AuthModule,
    AdminModule,
    SellerModule,
    CategoryModule,
    ProductModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
