import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { Role, SellerStatus } from 'src/generated/prisma/enums';
import { UpdateShopDto } from './dto/update-shop.dto';
import 'multer';

type File = Express.Multer.File;

@Injectable()
export class SellersService {
  constructor(private prisma: PrismaService) {}

  async createShop(userId: string, dto: CreateShopDto, logo: File) {
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
        logo: logo
          ? `uploads/tasks/${Date.now()}-${logo.originalname.replace(/\s+/g, '-')}`
          : undefined,
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

  async updateShop(userId: string, dto: UpdateShopDto, logo: File) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!seller) {
      throw new BadRequestException('Shop does not exist');
    }

    if (logo) {
      dto.logo = `uploads/tasks/${Date.now()}-${logo.originalname.replace(/\s+/g, '-')}`;
    }

    return this.prisma.sellerProfile.update({
      where: {
        userId,
      },

      data: dto,
    });
  }

  async getShop(userId: string) {
    return this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });
  }
}
