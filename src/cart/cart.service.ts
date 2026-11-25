import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from 'src/generated/prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemQuantityDto } from './dto/update-cart-item-quantity.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Add to cart from products page. Quantity sent is the added quantity
  async addToCart(userId: string, dto: AddToCartDto) {
    return this.prisma.$transaction(
      async (tx) => {
        // 1. Check if the product exists and is available.
        const product = await tx.product.findUnique({
          where: { id: dto.productId },
        });

        if (!product) throw new NotFoundException('Product not found');

        if (product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException('This product is not available');
        }

        if (product.stock < 1) {
          throw new BadRequestException('This product is out of stock');
        }

        // 2. Create the user's cart if it doesn't exist.
        const cart = await tx.cart.upsert({
          where: { userId },
          create: { userId },
          update: {},
        });

        // 3. Find an existing item for this product.
        const existingItem = await tx.cartItem.findUnique({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: product.id,
            },
          },
        });

        // 4. Calculate the resulting quantity (existingQuantity (can be 0 if cartItem doesn't exist) + newQuantity).
        const newQuantity = (existingItem?.quantity ?? 0) + dto.quantity;

        if (newQuantity > product.stock) {
          throw new BadRequestException(
            `Only ${product.stock} item(s) are currently available`,
          );
        }

        // 5. Create the item or increment its quantity if it already exists.
        await tx.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: product.id,
            },
          },
          create: {
            cartId: cart.id,
            productId: product.id,
            quantity: dto.quantity,
          },
          update: {
            quantity: newQuantity,
          },
        });

        // 6. Return the important data of the updated cart.
        const updatedCart = await tx.cart.findUnique({
          where: { id: cart.id },
          select: {
            id: true,
            items: {
              select: {
                id: true,
                quantity: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    images: {
                      select: {
                        url: true,
                      },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        });

        return updatedCart;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  // Update cart item from cart page in frontend. Quantity sent is the final desired quantity
  async updateCartItemQuantity(
    userId: string,
    itemId: string,
    dto: UpdateCartItemQuantityDto,
  ) {
    return this.prisma.$transaction(
      async (tx) => {
        const item = await tx.cartItem.findFirst({
          where: {
            id: itemId,
            cart: { userId },
          },
          include: { product: true },
        });

        if (!item) {
          throw new NotFoundException('Cart item not found');
        }

        if (item.product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException('This product is no longer available');
        }

        // quantity is the final desired quantity, not the number of additional items
        if (dto.quantity > item.product.stock) {
          throw new BadRequestException(
            `Only ${item.product.stock} item(s) are currently available`,
          );
        }

        return tx.cartItem.update({
          where: { id: item.id },
          data: { quantity: dto.quantity },
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                images: {
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                status: true,
                images: {
                  select: { url: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        totalQuantity: 0,
        total: '0.00',
      };
    }

    const totalQuantity = cart.items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    const total = cart.items
      .reduce(
        (total, item) =>
          total.plus(
            new Prisma.Decimal(item.product.price.toString()).mul(
              item.quantity,
            ),
          ),
        new Prisma.Decimal(0),
      )
      .toFixed(2);

    return {
      ...cart,
      totalQuantity,
      total,
    };
  }

  async removeCartItem(userId: string, itemId: string) {
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (result.count === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Item removed from cart successfully' };
  }

  async clearCart(userId: string) {
    const result = await this.prisma.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    return {
      message: 'Cart cleared successfully',
      removedItems: result.count,
    };
  }
}
