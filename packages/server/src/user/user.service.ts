import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByOpenId(openId: string) {
    return this.prisma.user.findUnique({
      where: { openId },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        wrongQuestions: {
          where: { mastered: false },
          take: 10,
          orderBy: { lastWrongAt: 'desc' },
        },
      },
    });
  }

  async getStats(userId: string) {
    const [totalPractice, correctCount, wrongCount, todayPractice] = await Promise.all([
      this.prisma.practiceRecord.count({
        where: { userId },
      }),
      this.prisma.practiceRecord.count({
        where: { userId, isCorrect: true },
      }),
      this.prisma.wrongQuestion.count({
        where: { userId, mastered: false },
      }),
      this.prisma.practiceRecord.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const accuracy = totalPractice > 0 ? (correctCount / totalPractice) * 100 : 0;

    return {
      totalPractice,
      correctCount,
      wrongCount,
      todayPractice,
      accuracy: Math.round(accuracy * 100) / 100,
    };
  }
}
