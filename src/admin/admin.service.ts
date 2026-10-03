import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { PrismaService } from 'prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: createAdminDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email is already used');
    }

    const hashedPassword = await bcrypt.hash(
      createAdminDto.password,
      this.configService.getOrThrow<number>('bcrypt.salt'),
    );

    const admin = await this.prisma.user.create({
      data: {
        name: createAdminDto.name,
        email: createAdminDto.email,
        password: hashedPassword,
        role: Role.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return admin;
  }
}
