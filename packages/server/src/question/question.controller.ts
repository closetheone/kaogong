import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QueryQuestionDto } from './dto/query-question.dto';

@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get()
  async findAll(@Query() query: QueryQuestionDto) {
    const result = await this.questionService.findAll(query);
    return { code: 0, message: 'success', data: result };
  }

  @Get('categories')
  async getCategories() {
    const result = await this.questionService.getCategories();
    return { code: 0, message: 'success', data: result };
  }

  @Get('count')
  async getCountByCategory() {
    const result = await this.questionService.getCountByCategory();
    return { code: 0, message: 'success', data: result };
  }

  @Get('random/:category')
  async getRandomQuestions(
    @Param('category') category: string,
    @Query('count') count: string = '10',
    @Query('excludeIds') excludeIds: string = '',
  ) {
    const excludeIdArray = excludeIds ? excludeIds.split(',') : [];
    const result = await this.questionService.getRandomQuestions(
      category,
      parseInt(count),
      excludeIdArray,
    );
    return { code: 0, message: 'success', data: result };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const question = await this.questionService.findById(id);
    return { code: 0, message: 'success', data: question };
  }
}
