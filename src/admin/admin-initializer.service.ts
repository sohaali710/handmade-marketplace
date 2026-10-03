import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { Role } from 'src/generated/prisma/enums';

@Injectable()
export class AdminInitializerService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createInitialAdmin();
  }

  private async createInitialAdmin() {
    const email = this.configService.getOrThrow<string>('admin.email');
    const password = this.configService.getOrThrow<string>('admin.password');
    const name = this.configService.get<string>('admin.name') ?? 'System Admin';

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      this.configService.getOrThrow<number>('bcrypt.salt'),
    );

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
      },
    });

    console.log(`Initial admin created: ${email}`);
  }
}
