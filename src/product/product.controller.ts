import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { RolesGuard } from 'src/common/guards/roles/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { AuthUser } from 'src/common/types/auth-user.type';
import { UUIdDto } from 'src/common/dto/uu-id.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  create(@Req() req: Request, @Body() dto: CreateProductDto) {
    const user = req['user'] as AuthUser;

    return this.productService.create(user.id, dto);
  }

  @Get('my-products')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  findMyProducts(@Req() req: Request) {
    const user = req['user'] as AuthUser;

    return this.productService.findMyProducts(user.id);
  }

  @Get('my-products/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  findMyProduct(@Req() req: Request, @Param() params: UUIdDto) {
    const user = req['user'] as AuthUser;

    return this.productService.findMyProduct(user.id, params.id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  update(
    @Req() req: Request,
    @Param() params: UUIdDto,
    @Body() dto: UpdateProductDto,
  ) {
    const user = req['user'] as AuthUser;

    return this.productService.update(user.id, params.id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.SELLER)
  remove(@Req() req: Request, @Param() params: UUIdDto) {
    const user = req['user'] as AuthUser;

    return this.productService.remove(user.id, params.id);
  }
}
