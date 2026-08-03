import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { QueryQuestionDto } from './dto/query-question.dto'

// 把 DB record 的 options 字符串 parse 成对象
function deserialize(q: any) {
  if (!q) return null
  let options = q.options
  if (typeof options === 'string') {
    try {
      options = JSON.parse(options)
    } catch {
      options = {}
    }
  }
  return { ...q, options }
}

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryQuestionDto) {
    const { category, subCategory, difficulty, year, examType, page = 1, pageSize = 20 } = query

    const where: any = {}
    if (category) where.category = category
    if (subCategory) where.subCategory = subCategory
    if (difficulty) where.difficulty = difficulty
    if (year) where.year = year
    if (examType) where.examType = examType

    const [total, list] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ year: 'desc' }, { number: 'asc' }],
      }),
    ])

    return { list: list.map(deserialize), total, page, pageSize }
  }

  async findById(id: string) {
    const q = await this.prisma.question.findUnique({ where: { id } })
    return deserialize(q)
  }

  async getRandomQuestions(category: string, count: number, excludeIds: string[] = []) {
    const where: any = {}
    if (category && category !== 'all' && category !== '%E5%85%A8%E9%83%A8') {
      where.category = decodeURIComponent(category)
    }
    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds }
    }

    // 先取多一些，然后随机打乱
    const take = Math.min(count * 3, 200)
    const qs = await this.prisma.question.findMany({
      where,
      take,
      orderBy: { number: 'asc' },
    })
    const shuffled = qs.sort(() => Math.random() - 0.5).slice(0, count)
    return shuffled.map(deserialize)
  }

  async getCategories() {
    const cats = await this.prisma.question.groupBy({
      by: ['category'],
      _count: { _all: true },
    })
    return cats.map((c) => ({ id: c.category, name: c.category, count: c._count._all }))
  }

  async getCountByCategory(): Promise<Record<string, number>> {
    const cats = await this.prisma.question.groupBy({
      by: ['category'],
      _count: { _all: true },
    })
    const result: Record<string, number> = {}
    for (const c of cats) {
      result[c.category] = c._count._all
    }
    return result
  }
}
