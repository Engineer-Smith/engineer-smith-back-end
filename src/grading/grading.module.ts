import { Module } from '@nestjs/common';
import { GradingService } from './grading.service';
import { NodeRunnerService } from './runners/node-runner.service';
import { PythonRunnerService } from './runners/python-runner.service';
import { SqlRunnerService } from './runners/sql-runner.service';
import { DartRunnerService } from './runners/dart-runner.service';
import { FillInBlankGraderService } from './graders/fill-in-blank.grader';

@Module({
  providers: [
    GradingService,
    NodeRunnerService,
    PythonRunnerService,
    SqlRunnerService,
    DartRunnerService,
    FillInBlankGraderService,
  ],
  exports: [GradingService],
})
export class GradingModule {}
