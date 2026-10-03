import { FileInterceptor } from '@nestjs/platform-express';
import {
  Controller,
  Post,
  Body,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { SellersService } from './seller.service';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from 'src/generated/prisma/enums';
import { CreateShopDto } from './dto/create-shop.dto';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import 'multer';
import { createParseFileValidator } from 'src/common/validators/files/files-validation-factory';

type File = Express.Multer.File;

@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Post('shop')
  @UseGuards(AuthGuard)
  @Roles(Role.USER)
  @UseInterceptors(FileInterceptor('logo'))
  async createShop(
    @Req() req,
    @Body() dto: CreateShopDto,
    @UploadedFile(
      createParseFileValidator(
        '2MB',
        ['jpeg', 'jpg', 'png', 'not-valid-type'],
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        false,
      ),
    )
    logo: File,
  ) {
    return this.sellersService.createShop(req.user.id, dto, logo);
  }

  @Patch('shop')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  @UseInterceptors(FileInterceptor('logo'))
  updateShop(
    @Req() req,
    @Body() dto: UpdateShopDto,
    @UploadedFile(
      createParseFileValidator(
        '2MB',
        ['jpeg', 'jpg', 'png'],
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        false,
      ),
    )
    logo: File,
  ) {
    return this.sellersService.updateShop(req.user.id, dto, logo);
  }

  @Get('shop')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  getShop(@Req() req) {
    return this.sellersService.getShop(req.user.id);
  }
}
