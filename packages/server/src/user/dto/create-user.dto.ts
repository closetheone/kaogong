import { IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  openId: string;

  @IsString()
  @IsOptional()
  unionId?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
