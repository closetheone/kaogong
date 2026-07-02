import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('submit')
  async submitAnswer(
    @Body() dto: SubmitAnswerDto & { userId: string },
  ) {
    const { userId, ...answerData } = dto;
    const result = await this.practiceService.submitAnswer(userId, answerData);
    return { code: 0, message: 'success', data: result };
  }

  @Get('history/:userId')
  async getHistory(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ) {
    const result = await this.practiceService.getUserPracticeHistory(
      userId,
      parseInt(page),
      parseInt(pageSize),
    );
    return { code: 0, message: 'success', data: result };
  }

  @Get('stats/:userId')
  async getDailyStats(
    @Param('userId') userId: string,
    @Query('days') days: string = '7',
  ) {
    const result = await this.practiceService.getDailyStats(userId, parseInt(days));
    return { code: 0, message: 'success', data: result };
  }
}
