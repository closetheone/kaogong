import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface RawQuestion {
  id: string
  source: string
  year: number
  examType: string
  category: string
  subCategory?: string
  number: number
  content: string
  options: Record<string, string>
  answer: string
  explanation: string
  difficulty: number
}

async function importFromJson(filePath: string) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ! 文件不存在: ${filePath}`)
    return 0
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  const questions: RawQuestion[] = parsed.questions || parsed
  if (!questions.length) return 0

  const sourceTitle = parsed.meta?.title || path.basename(filePath, '.json')

  // 从 source 或 meta 判断 examPaper（地市/副省/联考A等）
  const examPaperMatch = sourceTitle.match(/(地市|副省|省级|联考|江苏A|江苏B|江苏C|浙江A|浙江B|广东|山东|北京)/)
  const examPaper = examPaperMatch ? examPaperMatch[1] : null

  // 从 meta 判断年份
  const yearMatch = sourceTitle.match(/(\d{4})/)
  const fallbackYear = yearMatch ? parseInt(yearMatch[1]) : questions[0]?.year || 2025

  let imported = 0
  let skipped = 0

  for (const q of questions) {
    try {
      const exists = await prisma.question.findUnique({ where: { id: q.id } })
      if (exists) {
        skipped++
        continue
      }

      // 清洗选项：把混入其他选项的文本截断
      const cleanedOptions: Record<string, string> = {}
      const optionKeys = Object.keys(q.options || {}).sort()
      for (const key of optionKeys) {
        let text = String(q.options[key] || '').replace(/\s+/g, ' ').trim()
        text = text.replace(new RegExp(`^${key}[\\.\\s、]*`), '')
        for (const otherKey of optionKeys) {
          if (otherKey === key) continue
          const idx = text.search(new RegExp(`\\s+${otherKey}[\\.\\s、]`))
          if (idx > 0) text = text.substring(0, idx).trim()
        }
        cleanedOptions[key] = text
      }

      // 清洗解析
      let explanation = (q.explanation || '').replace(/^公考[\s\S]*?\f/, '').trim()

      await prisma.question.create({
        data: {
          id: q.id,
          source: q.source || sourceTitle,
          year: q.year || fallbackYear,
          examType: q.examType || (sourceTitle.includes('国考') ? '国考' : sourceTitle.includes('省考') ? '省考' : '其他'),
          examPaper,
          category: q.category,
          subCategory: q.subCategory || null,
          number: q.number || 0,
          difficulty: q.difficulty || 3,
          content: q.content,
          options: JSON.stringify(cleanedOptions),
          answer: q.answer,
          explanation,
        },
      })
      imported++
    } catch (e: any) {
      console.error(`  ! 导入 ${q.id} 失败:`, e.message)
    }
  }

  console.log(`  ✓ ${path.basename(filePath)}: 导入 ${imported}，跳过 ${skipped}`)
  return imported
}

async function main() {
  console.log('📚 开始导入题目数据...\n')

  // 导入 web/public/data 下所有真题 JSON
  const dataDir = path.join(__dirname, '../../web/public/data')
  let total = 0

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
    console.log(`找到 ${files.length} 个真题文件`)
    for (const file of files) {
      total += await importFromJson(path.join(dataDir, file))
    }
  }

  // 同时也导入 server/data/questions.json（如果存在）
  const legacyPath = path.join(__dirname, '../data/questions.json')
  if (fs.existsSync(legacyPath)) {
    total += await importFromJson(legacyPath)
  }

  // 打印统计
  const totalCount = await prisma.question.count()
  const catStats = await prisma.question.groupBy({
    by: ['category'],
    _count: { _all: true },
  })

  console.log(`\n✅ 导入完成，本次新增 ${total} 题`)
  console.log(`题库总计 ${totalCount} 题：`)
  for (const c of catStats) {
    console.log(`   ${c.category}: ${c._count._all} 题`)
  }
}

main()
  .catch((e) => {
    console.error('导入失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
