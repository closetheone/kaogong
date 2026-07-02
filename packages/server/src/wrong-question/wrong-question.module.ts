import { Module } from '@nestjs/common';
import { WrongQuestionService } from './wrong-question.service';
import { WrongQuestionController } from './wrong-question.controller';

@Module({
  providers: [WrongQuestionService],
  controllers: [WrongQuestionController],
  exports: [WrongQuestionService],
})
export class WrongQuestionModule {}
