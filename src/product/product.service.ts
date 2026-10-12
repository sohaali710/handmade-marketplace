import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto } from './dto/get-products.dto';
import { ProductStatus } from 'src/generated/prisma/enums';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async create(userId: string, dto: CreateProductDto) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const category = await this.prisma.category.findUnique({
      where: {
        id: dto.categoryId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        categoryId: dto.categoryId,
        sellerId: seller.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        status: true,
        categoryId: true,
        sellerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findMyProducts(userId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.product.findMany({
      where: {
        sellerId: seller.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMyProduct(userId: string, productId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(userId: string, productId: string, dto: UpdateProductDto) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: {
          id: dto.categoryId,
        },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    return this.prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...dto,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        status: true,
        categoryId: true,
        sellerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(userId: string, productId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        sellerId: seller.id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return {
      message: 'Product removed successfully',
    };
  }

  async findAll(query: GetProductsDto) {
    const cacheKey = this.getProductsCacheKey(query);
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const {
      search,
      categoryId,
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where = {
      status: ProductStatus.ACTIVE,

      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),

      ...(categoryId && {
        categoryId,
      }),

      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            price: {
              ...(minPrice !== undefined && {
                gte: minPrice,
              }),
              ...(maxPrice !== undefined && {
                lte: maxPrice,
              }),
            },
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,

        orderBy: {
          [sortBy]: sortOrder,
        },

        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },

          seller: {
            select: {
              id: true,
              shopName: true,
              logo: true,
            },
          },

          images: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      }),

      this.prisma.product.count({
        where,
      }),
    ]);

    const result = {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },

      data: products,
    };

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findOne(productId: string) {
    const cacheKey = `product:${productId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        status: ProductStatus.ACTIVE,
      },

      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },

        seller: {
          select: {
            id: true,
            shopName: true,
            description: true,
            logo: true,
          },
        },

        images: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.redis.set(cacheKey, product, 300); // 5 minutes

    return product;
  }

  private getProductsCacheKey(query: GetProductsDto): string {
    const {
      search = '',
      categoryId = '',
      page = 1,
      limit = 12,
      minPrice = '',
      maxPrice = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    return [
      'products',
      `search=${search}`,
      `category=${categoryId}`,
      `page=${page}`,
      `limit=${limit}`,
      `minPrice=${minPrice}`,
      `maxPrice=${maxPrice}`,
      `sortBy=${sortBy}`,
      `sortOrder=${sortOrder}`,
    ].join(':');
  }
}
