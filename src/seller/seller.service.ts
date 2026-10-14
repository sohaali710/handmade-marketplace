import { BadRequestException, Injectable, Post } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { Role, SellerProfileStatus } from 'src/generated/prisma/enums';
import { UpdateShopDto } from './dto/update-shop.dto';
import 'multer';
import { CloudinaryService } from 'src/common/utils/cloudinary/cloudinary.service';
import { Prisma } from 'src/generated/prisma/client';

type File = Express.Multer.File;

@Injectable()
export class SellerService {
  constructor(
    private prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createShop(userId: string, dto: CreateShopDto, logo: File) {
    const existing = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existing) throw new BadRequestException('Shop already exists');

    const shopNameUsed = await this.prisma.sellerProfile.findUnique({
      where: {
        shopName: dto.shopName,
      },
    });
    if (shopNameUsed) throw new BadRequestException('Shop name already exists');

    const uploadedLogo = logo
      ? await this.cloudinaryService.uploadImage(
          logo,
          'handmade-marketplace/seller-logos',
        )
      : null;

    const seller = await this.prisma.sellerProfile.create({
      data: {
        userId,
        shopName: dto.shopName,
        description: dto.description,

        phone: dto.phone,
        address: dto.address,
        logo: uploadedLogo
          ? {
              url: uploadedLogo.url,
              publicId: uploadedLogo.publicId,
            }
          : Prisma.JsonNull,
        facebookUrl: dto.facebookUrl,
        instagramUrl: dto.instagramUrl,

        status: SellerProfileStatus.ACTIVE,
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

  async updateShop(
    userId: string,
    dto: UpdateShopDto,
    logo?: Express.Multer.File,
  ) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!seller) {
      throw new BadRequestException('Shop does not exist');
    }

    // Check the name only when it is changing.
    if (dto.shopName && dto.shopName !== seller.shopName) {
      const shopNameUsed = await this.prisma.sellerProfile.findUnique({
        where: { shopName: dto.shopName },
      });

      if (shopNameUsed) {
        throw new BadRequestException('Shop name already exists');
      }
    }

    const oldLogo = seller.logo as { url?: string; publicId?: string } | null;

    // Upload the new logo first, if provided.
    const uploadedLogo = logo
      ? await this.cloudinaryService.uploadImage(
          logo,
          'handmade-marketplace/seller-logos',
        )
      : null;

    let updatedSeller;

    try {
      updatedSeller = await this.prisma.sellerProfile.update({
        where: { userId },
        data: {
          ...dto,
          ...(uploadedLogo && {
            logo: {
              url: uploadedLogo.url,
              publicId: uploadedLogo.publicId,
            },
          }),
        },
      });
    } catch (error) {
      // The database update failed; clean up the newly uploaded image.
      if (uploadedLogo) {
        try {
          await this.cloudinaryService.deleteImage(uploadedLogo.publicId);
        } catch {
          // Cleanup failure should not hide the original database error.
        }
      }

      throw error;
    }

    // Only delete the previous logo after the database update succeeds.
    if (uploadedLogo && oldLogo?.publicId) {
      try {
        await this.cloudinaryService.deleteImage(oldLogo.publicId);
      } catch {
        // The database already points to the new logo.
        // Log this failure for later cleanup.
      }
    }

    return updatedSeller;
  }

  async getShop(userId: string) {
    return this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });
  }
}
