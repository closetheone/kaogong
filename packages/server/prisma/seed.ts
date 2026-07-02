import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface QuestionData {
  id: string;
  source: string;
  category: string;
  subCategory?: string;
  content: string;
  options?: any;
  answer: string;
  explanation?: string;
  difficulty: number;
}

async function main() {
  console.log('开始导入题目数据...');

  // 读取题目数据文件
  const dataPath = path.join(__dirname, '../data/questions.json');
  
  if (!fs.existsSync(dataPath)) {
    console.log('题目数据文件不存在，跳过导入');
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(rawData);
  const questions: QuestionData[] = parsed.questions || parsed;

  console.log(`共 ${questions.length} 道题目待导入`);

  let imported = 0;
  let skipped = 0;

  for (const q of questions) {
    try {
      // 检查是否已存在
      const existing = await prisma.question.findUnique({
        where: { id: q.id },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // 创建题目
      await prisma.question.create({
        data: {
          id: q.id,
          source: q.source || '未知来源',
          year: parseInt(q.source?.match(/\d{4}/)?.[0] || '2024'),
          examType: q.source?.includes('国考') ? '国考' : q.source?.includes('省考') ? '省考' : '其他',
          category: q.category,
          subCategory: q.subCategory,
          difficulty: q.difficulty || 3,
          content: typeof q.content === 'string' ? q.content : JSON.stringify(q.content),
          options: q.options ? JSON.stringify(q.options) : null,
          answer: q.answer,
          explanation: q.explanation || null,
          knowledgePoints: JSON.stringify([]),
        },
      });

      imported++;

      if (imported % 100 === 0) {
        console.log(`已导入 ${imported} 道题目...`);
      }
    } catch (error) {
      console.error(`导入题目 ${q.id} 失败:`, error);
    }
  }

  console.log(`\n导入完成！`);
  console.log(`成功导入: ${imported} 道`);
  console.log(`跳过重复: ${skipped} 道`);
}

main()
  .catch((e) => {
    console.error('导入失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
