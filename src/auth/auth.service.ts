import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private ConfigService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) throw new ConflictException('Email is already used');

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.ConfigService.getOrThrow<number>('bcrypt.salt'),
    );

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    if (!user) {
      throw new BadRequestException('Wrong email or password');
    }

    const valid = await bcrypt.compare(loginDto.password, user.password);

    if (!valid) {
      throw new BadRequestException('Wrong email or password');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken: token,
    };
  }
}
