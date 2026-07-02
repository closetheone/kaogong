import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { QuestionModule } from './question/question.module';
import { PracticeModule } from './practice/practice.module';
import { WrongQuestionModule } from './wrong-question/wrong-question.module';
import { MockExamModule } from './mock-exam/mock-exam.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    QuestionModule,
    PracticeModule,
    WrongQuestionModule,
    MockExamModule,
    AiModule,
  ],
})
export class AppModule {}
