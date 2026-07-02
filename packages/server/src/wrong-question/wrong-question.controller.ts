import { Controller, Get, Post, Put, Body, Query, Param } from '@nestjs/common';
import { WrongQuestionService } from './wrong-question.service';

@Controller('wrong-question')
export class WrongQuestionController {
  constructor(private readonly wrongQuestionService: WrongQuestionService) {}

  @Get(':userId')
  async getWrongQuestions(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const result = await this.wrongQuestionService.getWrongQuestions(
      userId,
      parseInt(page),
      parseInt(pageSize),
    );
    return { code: 0, message: 'success', data: result };
  }

  @Get(':userId/review')
  async getReviewQuestions(
    @Param('userId') userId: string,
    @Query('count') count: string = '10',
  ) {
    const result = await this.wrongQuestionService.getReviewQuestions(
      userId,
      parseInt(count),
    );
    return { code: 0, message: 'success', data: result };
  }

  @Post(':userId/review/:questionId')
  async markAsReviewed(
    @Param('userId') userId: string,
    @Param('questionId') questionId: string,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    const result = await this.wrongQuestionService.markAsReviewed(
      userId,
      questionId,
      isCorrect,
    );
    return { code: 0, message: 'success', data: result };
  }

  @Put(':userId/note/:questionId')
  async addNote(
    @Param('userId') userId: string,
    @Param('questionId') questionId: string,
    @Body('note') note: string,
  ) {
    const result = await this.wrongQuestionService.addNote(
      userId,
      questionId,
      note,
    );
    return { code: 0, message: 'success', data: result };
  }

  @Get(':userId/stats')
  async getStats(@Param('userId') userId: string) {
    const result = await this.wrongQuestionService.getStats(userId);
    return { code: 0, message: 'success', data: result };
  }
}
