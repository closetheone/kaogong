import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface RawQuestion {
  id: string
  source: string
  year: number
  examType: string
  examPaper?: string
  category: string
  subCategory?: string
  number: number
  content: string
  options: Record<string, string>
  answer: string
  explanation: string
  difficulty: number
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * 清洗选项：处理多个选项挤在一起的问题
   */
  private cleanOptions(raw: Record<string, string>, keys: string[]): Record<string, string> {
    const cleaned: Record<string, string> = {}
    for (const key of keys) {
      let text = String(raw[key] || '').replace(/\s+/g, ' ').trim()
      text = text.replace(new RegExp(`^${key}[\\.\\s、]*`), '')
      for (const otherKey of keys) {
        if (otherKey === key) continue
        const pattern = new RegExp(`\\s+${otherKey}[\\.\\s、]`)
        const idx = text.search(pattern)
        if (idx > 0) text = text.substring(0, idx).trim()
      }
      cleaned[key] = text
    }
    return cleaned
  }

  private cleanExplanation(text: string): string {
    return (text || '')
      .replace(/^公考[\s\S]*?\f/, '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{3,}/g, '\n\n')
  }

  /**
   * 从 GitHub 开源题库批量导入
   * 来源：网上公开整理的行测真题 JSON
   */
  async crawlFromGithubJson() {
    // 几个整理好的公开真题仓库/文件
    const sources = [
      // 可以后续扩展更多来源
      // 'https://raw.githubusercontent.com/xxx/gwy-zhenti/master/2025-guokao.json',
    ]

    let totalImported = 0
    for (const url of sources) {
      try {
        this.logger.log(`正在抓取: ${url}`)
        const { data } = await axios.get(url, { timeout: 15000 })
        const questions: RawQuestion[] = data.questions || data
        const n = await this.bulkInsert(questions, url)
        totalImported += n
      } catch (e: any) {
        this.logger.warn(`抓取失败: ${url} - ${e.message}`)
      }
    }
    return { imported: totalImported }
  }

  /**
   * 从粉笔/华图列表页抓取（带反爬处理）
   * 预留接口，实际运行需要处理：
   * 1. User-Agent 轮换
   * 2. 请求间隔
   * 3. 代理池（如果需要）
   */
  async crawlHuatuCategoryList(categoryUrl: string) {
    this.logger.log(`抓取华图页面: ${categoryUrl}`)
    try {
      const { data } = await axios.get(categoryUrl, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
      })
      const $ = cheerio.load(data)
      // 根据实际页面结构解析
      // 华图/粉笔页面结构各异，需要逐个适配
      this.logger.warn('华图页面解析需要根据实际 HTML 结构调整选择器')
      return { parsed: 0 }
    } catch (e: any) {
      this.logger.error(`抓取失败: ${e.message}`)
      return { parsed: 0 }
    }
  }

  /**
   * 批量写入数据库（去重）
   */
  async bulkInsert(questions: RawQuestion[], source = 'manual'): Promise<number> {
    let imported = 0
    let skipped = 0

    for (const q of questions) {
      try {
        const exists = await this.prisma.question.findUnique({ where: { id: q.id } })
        if (exists) {
          skipped++
          continue
        }

        const optionKeys = Object.keys(q.options || {}).sort()
        const cleanedOptions = this.cleanOptions(q.options || {}, optionKeys)

        await this.prisma.question.create({
          data: {
            id: q.id,
            source: q.source || source,
            year: q.year || 0,
            examType: q.examType || '其他',
            examPaper: q.examPaper,
            category: q.category,
            subCategory: q.subCategory || null,
            number: q.number || 0,
            difficulty: q.difficulty || 3,
            content: q.content,
            options: JSON.stringify(cleanedOptions),
            answer: q.answer,
            explanation: this.cleanExplanation(q.explanation),
          },
        })
        imported++
      } catch (e: any) {
        this.logger.debug(`跳过题目 ${q.id}: ${e.message}`)
        skipped++
      }
    }

    this.logger.log(`导入 ${imported} 题，跳过 ${skipped} 题（来源：${source}）`)
    return imported
  }

  /**
   * 从本地 JSON 文件导入（兼容格式）
   */
  async importFromLocalFile(questions: any[], sourceName: string) {
    const raw: RawQuestion[] = questions.map((q, i) => ({
      id: q.id || `${sourceName}_${i}`,
      source: q.source || sourceName,
      year: q.year || parseInt(sourceName.match(/\d{4}/)?.[0] || '0') || 0,
      examType: q.examType || (sourceName.includes('国考') ? '国考' : '省考'),
      examPaper: q.examPaper,
      category: q.category || '未知',
      subCategory: q.subCategory,
      number: q.number || i + 1,
      content: q.content || '',
      options: q.options || {},
      answer: q.answer || '',
      explanation: q.explanation || '',
      difficulty: q.difficulty || 3,
    }))
    return this.bulkInsert(raw, sourceName)
  }

  /**
   * 题库统计
   */
  async getStats() {
    const total = await this.prisma.question.count()
    const byCategory = await this.prisma.question.groupBy({
      by: ['category'],
      _count: { _all: true },
    })
    const byYear = await this.prisma.question.groupBy({
      by: ['year'],
      _count: { _all: true },
      orderBy: { year: 'desc' },
    })
    return {
      total,
      byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })),
      byYear: byYear.map((y) => ({ year: y.year, count: y._count._all })),
    }
  }
}
