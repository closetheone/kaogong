import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  /**
   * 生成AI解析
   */
  async generateExplanation(questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('题目不存在');
    }

    // 模拟AI解析（实际项目中调用大模型API）
    const aiExplanation = {
      questionId,
      answer: question.answer,
      analysis: this.generateAnalysis(question),
      tips: this.generateTips(question),
      similarQuestions: await this.getSimilarQuestions(question),
      generatedAt: new Date(),
    };

    // 更新数据库
    await this.prisma.question.update({
      where: { id: questionId },
      data: {
        aiExplanation: JSON.stringify(aiExplanation),
        isAiParsed: true,
      },
    });

    return aiExplanation;
  }

  /**
   * 生成解析分析
   */
  private generateAnalysis(question: any) {
    const category = question.category;
    
    const analysisMap: Record<string, string> = {
      '常识判断': '本题考查常识判断能力，需要考生具备广泛的知识面和快速判断能力。',
      '言语理解与表达': '本题考查言语理解与表达能力，重点考察对文字材料的理解、分析和运用能力。',
      '数量关系': '本题考查数量关系，需要考生具备数学运算能力和逻辑推理能力。',
      '判断推理': '本题考查判断推理能力，包括图形推理、定义判断、类比推理和逻辑判断。',
      '资料分析': '本题考查资料分析能力，需要快速提取数据、计算和分析。',
    };

    return analysisMap[category] || '本题考查综合能力。';
  }

  /**
   * 生成解题技巧
   */
  private generateTips(question: any) {
    const category = question.category;
    
    const tipsMap: Record<string, string[]> = {
      '常识判断': [
        '排除法：先排除明显错误的选项',
        '关键词法：抓住题干中的关键词',
        '常识推断：运用生活常识和逻辑推断',
      ],
      '言语理解与表达': [
        '主旨概括：找出文段的中心思想',
        '语境分析：注意上下文的逻辑关系',
        '词语辨析：关注词语的细微差别',
      ],
      '数量关系': [
        '代入法：将选项代入验证',
        '特值法：设定特殊值简化计算',
        '方程法：建立方程求解',
      ],
      '判断推理': [
        '图形推理：观察图形的数量、位置、样式规律',
        '定义判断：抓住定义的关键要素',
        '逻辑判断：运用逻辑推理规则',
      ],
      '资料分析': [
        '快速定位：先找关键数据',
        '估算技巧：合理估算减少计算量',
        '比较技巧：掌握大小比较的方法',
      ],
    };

    return tipsMap[category] || ['仔细阅读题干', '注意审题', '合理分配时间'];
  }

  /**
   * 获取相似题目
   */
  private async getSimilarQuestions(question: any) {
    const similarQuestions = await this.prisma.question.findMany({
      where: {
        category: question.category,
        id: { not: question.id },
      },
      take: 3,
      select: {
        id: true,
        content: true,
        category: true,
      },
    });

    return similarQuestions;
  }

  /**
   * 智能问答
   */
  async askQuestion(questionId: string, userQuestion: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new Error('题目不存在');
    }

    // 模拟AI回答（实际项目中调用大模型API）
    const answer = this.generateAnswer(question, userQuestion);

    return {
      question: userQuestion,
      answer,
      relatedQuestion: {
        id: question.id,
        content: question.content.substring(0, 100) + '...',
      },
    };
  }

  /**
   * 生成回答
   */
  private generateAnswer(question: any, userQuestion: string) {
    // 简单的关键词匹配
    if (userQuestion.includes('为什么') || userQuestion.includes('原因')) {
      return `这道题的正确答案是${question.answer}。选择这个答案的原因是：${this.generateAnalysis(question)}通过仔细分析题干和选项，可以得出正确答案。`;
    }
    
    if (userQuestion.includes('怎么做') || userQuestion.includes('方法')) {
      return `解题方法：${this.generateTips(question).join('；')}。建议先理解题意，再运用相应技巧解答。`;
    }

    if (userQuestion.includes('知识点') || userQuestion.includes('考点')) {
      return `本题考查的知识点：${question.category}。重点考察${this.generateAnalysis(question)}`;
    }

    return `关于这道题，正确答案是${question.answer}。${this.generateAnalysis(question)}如有疑问，可以继续提问。`;
  }
}
