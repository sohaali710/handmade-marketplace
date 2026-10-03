import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminInitializerService } from './admin-initializer.service';
@Module({
  controllers: [AdminController],
  providers: [AdminService, AdminInitializerService],
})
export class AdminModule {}
