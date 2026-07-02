import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WrongQuestionService {
  constructor(private prisma: PrismaService) {}

  async getWrongQuestions(userId: string, page = 1, pageSize = 20) {
    const [total, wrongQuestions] = await Promise.all([
      this.prisma.wrongQuestion.count({
        where: { userId, mastered: false },
      }),
      this.prisma.wrongQuestion.findMany({
        where: { userId, mastered: false },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { lastWrongAt: 'desc' },
        include: {
          question: {
            select: {
              id: true,
              category: true,
              subCategory: true,
              content: true,
              options: true,
              answer: true,
              explanation: true,
              difficulty: true,
            },
          },
        },
      }),
    ]);

    return {
      list: wrongQuestions,
      total,
      page,
      pageSize,
    };
  }

  async getReviewQuestions(userId: string, count = 10) {
    // 获取需要复习的错题（nextReviewAt <= now）
    const now = new Date();
    
    const wrongQuestions = await this.prisma.wrongQuestion.findMany({
      where: {
        userId,
        mastered: false,
        nextReviewAt: { lte: now },
      },
      take: count,
      orderBy: { nextReviewAt: 'asc' },
      include: {
        question: {
          select: {
            id: true,
            category: true,
            subCategory: true,
            content: true,
            options: true,
            answer: true,
            explanation: true,
            difficulty: true,
          },
        },
      },
    });

    return wrongQuestions;
  }

  async markAsReviewed(userId: string, questionId: string, isCorrect: boolean) {
    const wrongQuestion = await this.prisma.wrongQuestion.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });

    if (!wrongQuestion) {
      throw new Error('错题记录不存在');
    }

    if (isCorrect) {
      // 答对了，增加复习次数，计算下次复习时间
      const reviewCount = wrongQuestion.reviewCount + 1;
      const nextReviewAt = this.calculateNextReview(reviewCount);
      
      // 如果复习次数达到5次，标记为已掌握
      const mastered = reviewCount >= 5;

      return this.prisma.wrongQuestion.update({
        where: { id: wrongQuestion.id },
        data: {
          reviewCount,
          nextReviewAt: mastered ? null : nextReviewAt,
          mastered,
        },
      });
    } else {
      // 答错了，重置复习次数
      const nextReviewAt = this.calculateNextReview(0);
      
      return this.prisma.wrongQuestion.update({
        where: { id: wrongQuestion.id },
        data: {
          reviewCount: 0,
          wrongCount: wrongQuestion.wrongCount + 1,
          lastWrongAt: new Date(),
          nextReviewAt,
        },
      });
    }
  }

  async addNote(userId: string, questionId: string, note: string) {
    return this.prisma.wrongQuestion.update({
      where: {
        userId_questionId: { userId, questionId },
      },
      data: { userNote: note },
    });
  }

  async getStats(userId: string) {
    const [total, mastered, needReview, byCategory] = await Promise.all([
      this.prisma.wrongQuestion.count({
        where: { userId, mastered: false },
      }),
      this.prisma.wrongQuestion.count({
        where: { userId, mastered: true },
      }),
      this.prisma.wrongQuestion.count({
        where: {
          userId,
          mastered: false,
          nextReviewAt: { lte: new Date() },
        },
      }),
      this.prisma.wrongQuestion.groupBy({
        by: ['questionId'],
        where: { userId, mastered: false },
        _count: true,
      }),
    ]);

    // 按分类统计
    const wrongQuestions = await this.prisma.wrongQuestion.findMany({
      where: { userId, mastered: false },
      include: {
        question: {
          select: { category: true },
        },
      },
    });

    const categoryMap = new Map<string, number>();
    wrongQuestions.forEach(wq => {
      const category = wq.question.category;
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    return {
      total,
      mastered,
      needReview,
      byCategory: Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      })),
    };
  }

  // 艾宾浩斯遗忘曲线
  private calculateNextReview(reviewCount: number): Date {
    const intervals = [1, 3, 7, 15, 30];
    const days = intervals[Math.min(reviewCount, intervals.length - 1)];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    return nextReview;
  }
}
