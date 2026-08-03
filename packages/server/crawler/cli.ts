import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { CrawlerService } from '../src/crawler/crawler.service'
import * as fs from 'fs'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const crawler = app.get(CrawlerService)

  console.log('📚 考公题库导入工具\n')

  const cmd = process.argv[2]
  const arg = process.argv[3]

  switch (cmd) {
    case 'stats': {
      const stats = await crawler.getStats()
      console.log(`题库总计: ${stats.total} 题`)
      console.log('\n按模块:')
      for (const c of stats.byCategory) {
        console.log(`  ${c.category}: ${c.count} 题`)
      }
      console.log('\n按年份:')
      for (const y of stats.byYear) {
        console.log(`  ${y.year}年: ${y.count} 题`)
      }
      break
    }

    case 'import': {
      // 导入指定本地 JSON 文件
      const filePath = path.resolve(arg || path.join(__dirname, '../../web/public/data'))
      const files = fs.statSync(filePath).isDirectory()
        ? fs.readdirSync(filePath).filter((f) => f.endsWith('.json'))
        : [path.basename(filePath)]
      const dir = fs.statSync(filePath).isDirectory() ? filePath : path.dirname(filePath)

      let total = 0
      for (const file of files) {
        const fullPath = path.join(dir, file)
        const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'))
        const questions = raw.questions || raw
        if (!Array.isArray(questions)) {
          console.log(`跳过 ${file}（格式不正确）`)
          continue
        }
        console.log(`导入 ${file} (${questions.length} 题)...`)
        const n = await crawler.importFromLocalFile(questions, raw.meta?.title || file.replace('.json', ''))
        console.log(`  新增 ${n} 题\n`)
        total += n
      }
      console.log(`完成，共新增 ${total} 题`)
      break
    }

    case 'crawl': {
      console.log('从远程来源抓取真题...')
      const result = await crawler.crawlFromGithubJson()
      console.log(`抓取完成，新增 ${result.imported} 题`)
      break
    }

    default:
      console.log('用法:')
      console.log('  ts-node crawler/cli.ts stats              查看题库统计')
      console.log('  ts-node crawler/cli.ts import [path]     导入本地 JSON 文件/目录')
      console.log('  ts-node crawler/cli.ts crawl              从远程来源抓取')
  }

  await app.close()
}

bootstrap()
