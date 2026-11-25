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
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { CartService } from './cart.service';
import { AuthUser } from 'src/common/types/auth-user.type';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  addToCart(@Req() req: Request, @Body() dto: AddToCartDto) {
    const user = req['user'] as AuthUser;
    return this.cartService.addToCart(user.id, dto);
  }

  @Get()
  getCart(@Req() req: Request) {
    const user = req['user'] as AuthUser;
    return this.cartService.getCart(user.id);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemQuantityDto,
  ) {
    const user = req['user'] as AuthUser;
    return this.cartService.updateCartItemQuantity(
      user.id,
      itemId,
      dto.quantity,
    );
  }

  @Delete('items/:itemId')
  removeCartItem(@Req() req: Request, @Param('itemId') itemId: string) {
    const user = req['user'] as AuthUser;
    return this.cartService.removeCartItem(user.id, itemId);
  }

  @Delete()
  clearCart(@Req() req: Request) {
    const user = req['user'] as AuthUser;
    return this.cartService.clearCart(user.id);
  }
}
