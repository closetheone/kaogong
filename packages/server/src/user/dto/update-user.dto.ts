import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  targetExam?: string;

  @IsOptional()
  targetDate?: Date;

  @IsString()
  @IsOptional()
  education?: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsString()
  @IsOptional()
  politicalStatus?: string;

  @IsInt()
  @IsOptional()
  workYears?: number;
}
