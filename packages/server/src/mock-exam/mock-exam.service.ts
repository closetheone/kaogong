import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MockExamService {
  constructor(private prisma: PrismaService) {}

  /**
   * 创建模拟考试
   */
  async createMockExam(userId: string, examType: string, duration: number) {
    // 根据考试类型随机抽取题目
    const questions = await this.getRandomQuestions(examType);

    if (questions.length === 0) {
      throw new HttpException('题库中暂无该类型题目', HttpStatus.BAD_REQUEST);
    }

    // 创建模拟考试记录
    const mockExam = await this.prisma.mockExam.create({
      data: {
        userId,
        examType,
        duration,
        questions: JSON.stringify(questions.map(q => q.id)),
        status: 'in_progress',
        startTime: new Date(),
      },
    });

    return {
      examId: mockExam.id,
      questions: questions.map(q => ({
        id: q.id,
        content: q.content,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      })),
      duration,
      totalQuestions: questions.length,
    };
  }

  /**
   * 提交模拟考试答案
   */
  async submitMockExam(examId: string, userId: string, answers: any[]) {
    const mockExam = await this.prisma.mockExam.findFirst({
      where: { id: examId, userId },
    });

    if (!mockExam) {
      throw new HttpException('考试不存在', HttpStatus.NOT_FOUND);
    }

    if (mockExam.status === 'completed') {
      throw new HttpException('考试已提交', HttpStatus.BAD_REQUEST);
    }

    // 计算得分
    const questionIds = JSON.parse(mockExam.questions);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    let correctCount = 0;
    const results = questions.map(question => {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const isCorrect = userAnswer?.answer === question.answer;
      if (isCorrect) correctCount++;

      return {
        questionId: question.id,
        userAnswer: userAnswer?.answer || null,
        correctAnswer: question.answer,
        isCorrect,
        category: question.category,
      };
    });

    // 按分类统计
    const categoryStats = this.calculateCategoryStats(results);

    // 计算总分（百分制）
    const score = Math.round((correctCount / questions.length) * 100);

    // 更新考试记录
    await this.prisma.mockExam.update({
      where: { id: examId },
      data: {
        status: 'completed',
        endTime: new Date(),
        score,
        correctCount,
        totalCount: questions.length,
        answers: JSON.stringify(results),
        categoryStats: JSON.stringify(categoryStats),
      },
    });

    return {
      examId,
      score,
      correctCount,
      totalCount: questions.length,
      categoryStats,
      results,
    };
  }

  /**
   * 获取模拟考试历史
   */
  async getMockExamHistory(userId: string, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [exams, total] = await Promise.all([
      this.prisma.mockExam.findMany({
        where: { userId, status: 'completed' },
        orderBy: { endTime: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.mockExam.count({
        where: { userId, status: 'completed' },
      }),
    ]);

    return {
      list: exams.map(exam => ({
        id: exam.id,
        examType: exam.examType,
        score: exam.score,
        correctCount: exam.correctCount,
        totalCount: exam.totalCount,
        duration: exam.duration,
        startTime: exam.startTime,
        endTime: exam.endTime,
        categoryStats: exam.categoryStats ? JSON.parse(exam.categoryStats) : null,
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取模拟考试详情
   */
  async getMockExamDetail(examId: string, userId: string) {
    const mockExam = await this.prisma.mockExam.findFirst({
      where: { id: examId, userId },
    });

    if (!mockExam) {
      throw new HttpException('考试不存在', HttpStatus.NOT_FOUND);
    }

    const questionIds = JSON.parse(mockExam.questions);
    const questions = await this.prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const answers = mockExam.answers ? JSON.parse(mockExam.answers) : [];

    return {
      exam: {
        id: mockExam.id,
        examType: mockExam.examType,
        score: mockExam.score,
        correctCount: mockExam.correctCount,
        totalCount: mockExam.totalCount,
        duration: mockExam.duration,
        startTime: mockExam.startTime,
        endTime: mockExam.endTime,
        status: mockExam.status,
      },
      questions: questions.map(q => ({
        id: q.id,
        content: q.content,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
        answer: q.answer,
        explanation: q.explanation,
      })),
      answers,
      categoryStats: mockExam.categoryStats ? JSON.parse(mockExam.categoryStats) : null,
    };
  }

  /**
   * 随机抽取题目
   */
  private async getRandomQuestions(examType: string, count = 30) {
    // 根据考试类型确定题目分类
    const categories = this.getCategoriesByExamType(examType);

    // 每个分类抽取一定数量的题目
    const questionsPerCategory = Math.ceil(count / categories.length);
    const allQuestions = [];

    for (const category of categories) {
      const questions = await this.prisma.question.findMany({
        where: { category },
        orderBy: { createdAt: 'desc' },
        take: questionsPerCategory,
      });
      allQuestions.push(...questions);
    }

    // 随机打乱
    return allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
  }

  /**
   * 根据考试类型获取题目分类
   */
  private getCategoriesByExamType(examType: string): string[] {
    const categoryMap: Record<string, string[]> = {
      '行测': ['常识判断', '言语理解与表达', '数量关系', '判断推理', '资料分析'],
      '申论': ['申论'],
      '综合': ['常识判断', '言语理解与表达', '数量关系', '判断推理', '资料分析', '申论'],
    };

    return categoryMap[examType] || categoryMap['行测'];
  }

  /**
   * 计算分类统计
   */
  private calculateCategoryStats(results: any[]) {
    const stats: Record<string, { total: number; correct: number; accuracy: number }> = {};

    results.forEach(result => {
      const category = result.category;
      if (!stats[category]) {
        stats[category] = { total: 0, correct: 0, accuracy: 0 };
      }
      stats[category].total++;
      if (result.isCorrect) {
        stats[category].correct++;
      }
    });

    // 计算正确率
    Object.keys(stats).forEach(category => {
      const stat = stats[category];
      stat.accuracy = Math.round((stat.correct / stat.total) * 100);
    });

    return stats;
  }
}
