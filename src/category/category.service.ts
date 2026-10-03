import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;

    const existingCategory = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.create({
      data: {
        name,
        description,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    const { name, description } = updateCategoryDto;

    if (name) {
      const existingCategory = await this.prisma.category.findFirst({
        where: {
          name,
          NOT: {
            id,
          },
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name,
        description,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.category.delete({
      where: { id },
    });

    return { message: 'Category with id ' + id + ' deleted successfully' };
  }
}
