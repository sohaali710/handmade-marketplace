import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SellersService } from './sellers.service';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { CreateShopDto } from './dto/create-shop.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('shop')
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  async createShop(@Req() req, @Body() dto: CreateShopDto) {
    return this.sellersService.createShop(req.user.id, dto);
  }

  @Patch('shop')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  updateShop(@Req() req, @Body() dto: UpdateShopDto) {
    return this.sellersService.updateShop(req.user.id, dto);
  }
}
