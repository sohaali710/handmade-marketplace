import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { SellersModule } from './sellers/sellers.module';
import { envValidationSchema } from './common/config/env.validation';
import envConfig from './common/config/env.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.development.env'
          : '.production.env',

      isGlobal: true,
      load: [envConfig],
      validationSchema: envValidationSchema,
    }),

    AuthModule,
    SellersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
