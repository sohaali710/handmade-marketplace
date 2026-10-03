import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { UUIdDto } from 'src/common/dto/uu-id.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param() params: UUIdDto) {
    return this.categoryService.findOne(params.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  update(@Param() params: UUIdDto, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(params.id, dto);
  }

  @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  remove(@Param() params: UUIdDto) {
    return this.categoryService.remove(params.id);
  }
}
