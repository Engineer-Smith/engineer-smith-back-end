import { Injectable, Logger } from '@nestjs/common';
import { Worker } from 'worker_threads';
import * as path from 'path';
import { GradingResult, TestCaseDto } from '../dto';

@Injectable()
export class PythonRunnerService {
  private readonly logger = new Logger(PythonRunnerService.name);

  /**
   * Run test cases against Python code using Pyodide in a worker thread
   */
  async run(params: {
    code: string;
    entryFunction: string;
    testCases: TestCaseDto[];
    timeoutMs: number;
  }): Promise<GradingResult> {
    const { code, entryFunction, testCases, timeoutMs } = params;

    return new Promise((resolve) => {
      const workerPath = path.join(__dirname, 'python.worker.js');
      
      const worker = new Worker(workerPath, {
        workerData: { code, entryFunction, testCases, timeoutMs },
      });

      const timeout = setTimeout(() => {
        worker.terminate();
        resolve({
          success: false,
          testResults: [],
          overallPassed: false,
          totalTestsPassed: 0,
          totalTests: testCases.length,
          consoleLogs: [],
          executionError: 'Execution timed out',
          compilationError: null,
        });
      }, timeoutMs + 1000);

      worker.on('message', (result: GradingResult) => {
        clearTimeout(timeout);
        resolve(result);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        this.logger.error('Python worker error:', error);
        resolve({
          success: false,
          testResults: [],
          overallPassed: false,
          totalTestsPassed: 0,
          totalTests: testCases.length,
          consoleLogs: [],
          executionError: error.message,
          compilationError: null,
        });
      });
    });
  }
}
