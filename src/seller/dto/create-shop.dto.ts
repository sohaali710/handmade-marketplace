import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateShopDto {
  @IsString()
  shopName!: string;

  @IsString()
  description!: string;

  @IsString()
  phone!: string;

  @IsString()
  address!: string;

  @IsOptional()
  @IsJSON()
  logo?: string;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;
}
