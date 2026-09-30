import { IsUUID } from 'class-validator';

export class UUIdDto {
  @IsUUID()
  id!: string;
}
