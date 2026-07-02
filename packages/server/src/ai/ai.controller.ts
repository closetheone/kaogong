import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 生成AI解析
   */
  @Post('explain/:questionId')
  async generateExplanation(@Param('questionId') questionId: string) {
    const result = await this.aiService.generateExplanation(questionId);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }

  /**
   * 智能问答
   */
  @Post('ask/:questionId')
  async askQuestion(
    @Param('questionId') questionId: string,
    @Body('question') question: string,
  ) {
    const result = await this.aiService.askQuestion(questionId, question);
    return {
      code: 0,
      message: 'success',
      data: result,
    };
  }
}
