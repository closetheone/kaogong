import { Module } from '@nestjs/common';
import { MockExamService } from './mock-exam.service';
import { MockExamController } from './mock-exam.controller';

@Module({
  providers: [MockExamService],
  controllers: [MockExamController],
})
export class MockExamModule {}
