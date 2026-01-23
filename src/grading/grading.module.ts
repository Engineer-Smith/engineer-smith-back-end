import { Module } from '@nestjs/common';
import { GradingService } from './grading.service';
import { CodeExecutionService } from './code-execution.service';
import { GradingController } from './grading.controller';
import { NodeRunnerService } from './runners/node-runner.service';
import { PythonRunnerService } from './runners/python-runner.service';
import { SqlRunnerService } from './runners/sql-runner.service';
import { DartRunnerService } from './runners/dart-runner.service';
import { FillInBlankGraderService } from './graders/fill-in-blank.grader';
import { CodeScannerService } from './security/code-scanner.service';

@Module({
  controllers: [GradingController],
  providers: [
    GradingService,
    CodeExecutionService,
    CodeScannerService,
    NodeRunnerService,
    PythonRunnerService,
    SqlRunnerService,
    DartRunnerService,
    FillInBlankGraderService,
  ],
  exports: [GradingService, CodeExecutionService, CodeScannerService],
})
export class GradingModule {}

