import type { Question } from '@/types'

const OPTION_KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * 清洗题目选项：
 * 原始真题 JSON 里部分题目的选项存在 A 选项混入 B/C/D 的问题（如组合选择题
 * "1项 B.2项 C.3项 D.4项" 全塞在 options.A 里）。
 * 本函数从 content 末尾或 options 中智能拆分出完整的 A/B/C/D 选项。
 */
export function cleanQuestionOptions(q: Question): Question {
  if (!q?.options) return q
  const cleaned = splitOptions(q.options, q.content || '')
  return { ...q, options: cleaned }
}

function splitOptions(
  raw: Record<string, string>,
  content: string,
): Record<string, string> {
  // 策略 1：从题干 content 末尾提取 A./B./C./D. 选项
  const tail = content.slice(-600)
  const fromContent = extractFromText(tail)
  if (Object.keys(fromContent).length >= 4) {
    return fromContent
  }

  // 策略 2：拆分 raw 里混在一起的选项
  const result: Record<string, string> = {}
  for (const key of OPTION_KEYS) {
    if (!raw[key]) continue
    const text = String(raw[key])
    const hasOtherKey = /\s+[B-F][\.、．]/.test(text)
    if (key === 'A' && hasOtherKey && Object.keys(raw).length <= 2) {
      const firstMatch = text.match(/\s+[B-F][\.、．]/)
      if (firstMatch && firstMatch.index !== undefined) {
        result['A'] = tidy(text.slice(0, firstMatch.index))
        const rest = text.slice(firstMatch.index)
        const re = /([B-F])[\.、．]\s*([\s\S]*?)(?=\s+[B-F][\.、．]|$)/g
        let m
        while ((m = re.exec(rest)) !== null) {
          result[m[1]] = tidy(m[2])
        }
      } else {
        result[key] = tidyOne(text, key)
      }
    } else {
      result[key] = tidyOne(text, key)
    }
  }
  return result
}

function extractFromText(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /([A-F])[\.、．]\s*([\s\S]*?)(?=\s+[A-F][\.、．]|$)/g
  let m
  while ((m = re.exec(text)) !== null) {
    const t = tidy(m[2])
    // 过滤掉内容太短/像"4 项"这种可能是题号残留的
    if (t.length >= 2) out[m[1]] = t
  }
  return out
}

function tidy(s: string): string {
  return s
    .replace(/[\n\r\f\v]+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/[　]+/g, ' ')
    .replace(/公考[\s\S]*$/m, '') // 水印
    .replace(/持续更新[\s\S]*$/m, '')
    .trim()
}

function tidyOne(text: string, currentKey: string): string {
  let t = tidy(text)
  t = t.replace(new RegExp(`^${currentKey}[\\.、．\\s]*`), '')
  for (const k of OPTION_KEYS) {
    if (k === currentKey) continue
    const idx = t.search(new RegExp(`\\s+${k}[\\.、．]`))
    if (idx > 0) t = t.substring(0, idx).trim()
  }
  return t
}

/**
 * 批量清洗一组题目
 */
export function cleanQuestions(qs: Question[]): Question[] {
  return qs.map(cleanQuestionOptions)
}
