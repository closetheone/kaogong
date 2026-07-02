import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async submitAnswer(userId: string, dto: SubmitAnswerDto) {
    const { questionId, userAnswer, timeSpent, practiceType } = dto;

    // 获取题目正确答案
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('题目不存在');
    }

    const isCorrect = userAnswer === question.answer;

    // 创建刷题记录
    const record = await this.prisma.practiceRecord.create({
      data: {
        userId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent,
        practiceType,
      },
    });

    // 如果答错，加入错题本
    if (!isCorrect) {
      await this.addToWrongQuestion(userId, questionId);
    }

    return {
      isCorrect,
      correctAnswer: question.answer,
      explanation: question.explanation,
      record,
    };
  }

  async addToWrongQuestion(userId: string, questionId: string) {
    // 检查是否已存在
    const existing = await this.prisma.wrongQuestion.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (existing) {
      // 更新错误次数和下次复习时间
      const wrongCount = existing.wrongCount + 1;
      const nextReviewAt = this.calculateNextReview(existing.reviewCount);
      
      return this.prisma.wrongQuestion.update({
        where: { id: existing.id },
        data: {
          wrongCount,
          lastWrongAt: new Date(),
          nextReviewAt,
        },
      });
    } else {
      // 新建错题记录
      const nextReviewAt = this.calculateNextReview(0);
      
      return this.prisma.wrongQuestion.create({
        data: {
          userId,
          questionId,
          nextReviewAt,
        },
      });
    }
  }

  // 艾宾浩斯遗忘曲线计算下次复习时间
  private calculateNextReview(reviewCount: number): Date {
    const intervals = [1, 3, 7, 15, 30]; // 天数
    const days = intervals[Math.min(reviewCount, intervals.length - 1)];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview;
  }

  async getUserPracticeHistory(userId: string, page = 1, pageSize = 20) {
    const [total, records] = await Promise.all([
      this.prisma.practiceRecord.count({ where: { userId } }),
      this.prisma.practiceRecord.findMany({
        where: { userId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          question: {
            select: {
              id: true,
              category: true,
              subCategory: true,
              content: true,
              difficulty: true,
            },
          },
        },
      }),
    ]);

    return {
      list: records,
      total,
      page,
      pageSize,
    };
  }

  async getDailyStats(userId: string, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await this.prisma.practiceRecord.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 按日期分组统计
    const statsMap = new Map<string, { total: number; correct: number }>();
    
    records.forEach(record => {
      const date = record.createdAt.toISOString().split('T')[0];
      if (!statsMap.has(date)) {
        statsMap.set(date, { total: 0, correct: 0 });
      }
      const stats = statsMap.get(date)!;
      stats.total++;
      if (record.isCorrect) stats.correct++;
    });

    return Array.from(statsMap.entries()).map(([date, stats]) => ({
      date,
      total: stats.total,
      correct: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
  }
}
