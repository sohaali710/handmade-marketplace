import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

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
}
