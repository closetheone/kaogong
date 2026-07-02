import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { MockExamService } from './mock-exam.service';

@Controller('mock-exam')
export class MockExamController {
  constructor(private readonly mockExamService: MockExamService) {}

  /**
   * 创建模拟考试
   */
  @Post('create')
  async createMockExam(
    @Body('userId') userId: string,
    @Body('examType') examType: string,
    @Body('duration') duration: number,
  ) {
    const result = await this.mockExamService.createMockExam(userId, examType, duration);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 提交模拟考试答案
   */
  @Post('submit')
  async submitMockExam(
    @Body('examId') examId: string,
    @Body('userId') userId: string,
    @Body('answers') answers: any[],
  ) {
    const result = await this.mockExamService.submitMockExam(examId, userId, answers);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取模拟考试历史
   */
  @Get('history')
  async getMockExamHistory(
    @Query('userId') userId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ) {
    const result = await this.mockExamService.getMockExamHistory(userId, page, pageSize);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 获取模拟考试详情
   */
  @Get('detail/:examId')
  async getMockExamDetail(
    @Param('examId') examId: string,
    @Query('userId') userId: string,
  ) {
    const result = await this.mockExamService.getMockExamDetail(examId, userId);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
