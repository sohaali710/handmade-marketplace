import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { Role, SellerStatus } from 'src/generated/prisma/enums';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async createShop(userId: string, dto: CreateShopDto) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existing) {
      throw new BadRequestException('Shop already exists');
    }

    const seller = await this.prisma.sellerProfile.create({
      data: {
        userId,
        shopName: dto.shopName,
        description: dto.description,

        phone: dto.phone,
        address: dto.address,
        logo: dto.logo,
        facebookUrl: dto.facebookUrl,
        instagramUrl: dto.instagramUrl,

        status: SellerStatus.ACTIVE,
      },
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        role: Role.SELLER,
      },
    });

    return seller;
  }

  async updateShop(userId: string, dto: UpdateShopDto) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new BadRequestException('Shop does not exist');
    }

    return this.prisma.sellerProfile.update({
      where: {
        userId,
      },

      data: dto,
    });
  }
}
