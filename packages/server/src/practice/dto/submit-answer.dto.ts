import { IsString, IsInt, IsOptional } from 'class-validator';

export class SubmitAnswerDto {
  @IsString()
  questionId: string;

  @IsString()
  userAnswer: string;

  @IsInt()
  timeSpent: number;

  @IsString()
  @IsOptional()
  practiceType?: string;
}
