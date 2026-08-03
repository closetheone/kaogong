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

/**
 * 智能清洗选项：
 * 1. 如果只有 A 但内容里包含 B./C./D.，拆分出来
 * 2. 每个选项去掉前缀 "A." "A、" 等
 * 3. 截断选项里混入的其他选项文本
 */
function splitOptions(raw: Record<string, string>, content: string): Record<string, string> {
  const allKeys = ['A', 'B', 'C', 'D', 'E', 'F']
  const result: Record<string, string> = {}

  // 情况1：原始 JSON 里 A 包含了 "1项  B.2项  C.3项  D.4项" 这种组合
  // 先检查 content 末尾是否有 "A.xxx B.xxx C.xxx D.xxx" 模式（组合选择题选项在题干末尾）
  // 从 content 提取 "A.xxx  B.xxx  C.xxx  D.xxx" 到选项结束
  const optionPattern = /([A-F])[\.、．]\s*([\s\S]*?)(?=\s+[A-F][\.、．]|$)/g

  // 先从 content 末尾提取选项（如果 content 里含 A./B./C./D.）
  let contentOptions: Record<string, string> = {}
  let contentMatch
  const contentToSearch = content.slice(-500) // 只在 content 末尾 500 字查找选项
  while ((contentMatch = optionPattern.exec(contentToSearch)) !== null) {
    const key = contentMatch[1]
    let text = contentMatch[2].trim()
    contentOptions[key] = text
  }

  // 如果从 content 里提取到了 4 个选项，直接用
  const contentKeys = Object.keys(contentOptions)
  if (contentKeys.length >= 4) {
    for (const key of allKeys) {
      if (contentOptions[key]) {
        result[key] = cleanText(contentOptions[key])
      }
    }
    return finalize(result)
  }

  // 情况2：raw 里某个 key（通常是 A）包含多个选项文本
  // 遍历每个 raw 选项，检查里面是否包含其他选项标记
  for (const key of allKeys) {
    if (!raw[key]) continue
    const text = String(raw[key])

    // 检查是否包含 "B."/"B、" 等其他选项标记
    const otherKeyPattern = /\s+([B-F])[\.、．]\s*/
    const otherMatch = text.match(otherKeyPattern)
    if (otherMatch && key === 'A' && Object.keys(raw).length <= 2) {
      // A 选项里混入了 B/C/D，拆分
      const splitRegex = /\s+([A-F])[\.、．]\s*/g
      const parts: { key: string; text: string }[] = []
      let lastIdx = 0
      let m
      let firstKeyFound = false
      splitRegex.lastIndex = 0
      // 先把 A 自己的内容提出来（从开头到第一个 B./B、）
      const firstOther = text.match(/\s+[B-F][\.、．]/)
      if (firstOther && firstOther.index !== undefined) {
        parts.push({ key: 'A', text: text.slice(0, firstOther.index) })
        // 然后继续分其他选项
        const rest = text.slice(firstOther.index)
        const restRegex = /([B-F])[\.、．]\s*([\s\S]*?)(?=\s+[B-F][\.、．]|$)/g
        let rm
        while ((rm = restRegex.exec(rest)) !== null) {
          parts.push({ key: rm[1], text: rm[2] })
        }
      } else {
        parts.push({ key, text })
      }
      for (const p of parts) {
        result[p.key] = cleanText(p.text)
      }
    } else {
      result[key] = cleanSingleOption(text, key, allKeys)
    }
  }

  return finalize(result)
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\n\r]+/g, ' ')
    .trim()
    .replace(/^[\s　]+/, '')
}

function cleanSingleOption(text: string, currentKey: string, allKeys: string[]): string {
  let t = cleanText(text)
  // 去掉选项前的 "A."
  t = t.replace(new RegExp(`^${currentKey}[\\.、．\\s]*`), '')
  // 去掉后面混入的其他选项
  for (const k of allKeys) {
    if (k === currentKey) continue
    const idx = t.search(new RegExp(`\\s+${k}[\\.、．]`))
    if (idx > 0) t = t.substring(0, idx).trim()
  }
  return t
}

function finalize(opts: Record<string, string>): Record<string, string> {
  const clean: Record<string, string> = {}
  for (const [k, v] of Object.entries(opts)) {
    const t = v.trim()
    if (t && t.length > 0) clean[k] = t
  }
  return clean
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
  const examPaperMatch = sourceTitle.match(/(地市|副省|省级|联考|江苏A|江苏B|江苏C|浙江A|浙江B|广东|山东|北京)/)
  const examPaper = examPaperMatch ? examPaperMatch[1] : null
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

      // 智能拆分选项
      const cleanedOptions = splitOptions(q.options || {}, q.content || '')

      // 清洗解析
      let explanation = (q.explanation || '')
        .replace(/^公考[\s\S]*?\f/, '')
        .replace(/[\s\S]*?持续更新[\s\S]*$/m, '')
        .trim()

      await prisma.question.create({
        data: {
          id: q.id,
          source: q.source || sourceTitle,
          year: q.year || fallbackYear,
          examType:
            q.examType ||
            (sourceTitle.includes('国考') ? '国考' : sourceTitle.includes('省考') ? '省考' : '其他'),
          examPaper,
          category: q.category,
          subCategory: q.subCategory || null,
          number: q.number || 0,
          difficulty: q.difficulty || 3,
          content: cleanText(q.content),
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

  const dataDir = path.join(__dirname, '../../web/public/data')
  let total = 0

  if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'))
    console.log(`找到 ${files.length} 个真题文件`)
    for (const file of files) {
      total += await importFromJson(path.join(dataDir, file))
    }
  }

  const legacyPath = path.join(__dirname, '../data/questions.json')
  if (fs.existsSync(legacyPath)) {
    total += await importFromJson(legacyPath)
  }

  const totalCount = await prisma.question.count()
  const catStats = await prisma.question.groupBy({ by: ['category'], _count: { _all: true } })

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
