import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryQuestionDto } from './dto/query-question.dto';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryQuestionDto) {
    const { category, subCategory, difficulty, year, examType, page = 1, pageSize = 10 } = query;
    
    const where: any = {};
    if (category) where.category = category;
    if (subCategory) where.subCategory = subCategory;
    if (difficulty) where.difficulty = difficulty;
    if (year) where.year = year;
    if (examType) where.examType = examType;

    const [total, questions] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      list: questions,
      total,
      page,
      pageSize,
    };
  }

  async findById(id: string) {
    return this.prisma.question.findUnique({
      where: { id },
    });
  }

  async getRandomQuestions(category: string, count: number, excludeIds: string[] = []) {
    const where: any = { category };
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    // 获取总数
    const total = await this.prisma.question.count({ where });
    
    // 随机跳过
    const skip = Math.floor(Math.random() * Math.max(0, total - count));
    
    return this.prisma.question.findMany({
      where,
      skip,
      take: count,
    });
  }

  async getCategories() {
    const questions = await this.prisma.question.findMany({
      select: {
        category: true,
        subCategory: true,
      },
      distinct: ['category', 'subCategory'],
    });

    // 按category分组
    const categoryMap = new Map<string, Set<string>>();
    questions.forEach(q => {
      if (!categoryMap.has(q.category)) {
        categoryMap.set(q.category, new Set());
      }
      if (q.subCategory) {
        categoryMap.get(q.category)!.add(q.subCategory);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, subCategories]) => ({
      category,
      subCategories: Array.from(subCategories),
    }));
  }

  async getCountByCategory() {
    const questions = await this.prisma.question.findMany({
      select: { category: true },
    });

    const countMap = new Map<string, number>();
    questions.forEach(q => {
      countMap.set(q.category, (countMap.get(q.category) || 0) + 1);
    });

    return Array.from(countMap.entries()).map(([category, count]) => ({
      category,
      count,
    }));
  }
}
