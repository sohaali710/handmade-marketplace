import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'src/generated/prisma/enums';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  createAdmin(@Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(dto);
  }
}
