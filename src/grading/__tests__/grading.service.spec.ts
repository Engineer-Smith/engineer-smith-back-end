import { Test, TestingModule } from '@nestjs/testing';
import { GradingService } from '../grading.service';
import { NodeRunnerService } from '../runners/node-runner.service';
import { PythonRunnerService } from '../runners/python-runner.service';
import { SqlRunnerService } from '../runners/sql-runner.service';
import { DartRunnerService } from '../runners/dart-runner.service';
import { FillInBlankGraderService } from '../graders/fill-in-blank.grader';
import { Runtime, Language } from '../dto';

describe('GradingService', () => {
  let service: GradingService;
  let nodeRunner: jest.Mocked<NodeRunnerService>;
  let pythonRunner: jest.Mocked<PythonRunnerService>;
  let sqlRunner: jest.Mocked<SqlRunnerService>;
  let dartRunner: jest.Mocked<DartRunnerService>;
  let fillInBlankGrader: FillInBlankGraderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradingService,
        FillInBlankGraderService,
        {
          provide: NodeRunnerService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: PythonRunnerService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: SqlRunnerService,
          useValue: {
            run: jest.fn(),
          },
        },
        {
          provide: DartRunnerService,
          useValue: {
            run: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GradingService>(GradingService);
    nodeRunner = module.get(NodeRunnerService);
    pythonRunner = module.get(PythonRunnerService);
    sqlRunner = module.get(SqlRunnerService);
    dartRunner = module.get(DartRunnerService);
    fillInBlankGrader = module.get(FillInBlankGraderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runCodeTests', () => {
    const mockSuccessResult = {
      success: true,
      testResults: [
        {
          testName: 'Test case 1',
          testCaseIndex: 0,
          passed: true,
          actualOutput: '5',
          expectedOutput: '5',
          executionTime: 10,
          consoleLogs: [],
          error: null,
        },
      ],
      overallPassed: true,
      totalTestsPassed: 1,
      totalTests: 1,
      consoleLogs: [],
      executionError: null,
      compilationError: null,
    };

    it('should route to NodeRunner for node runtime', async () => {
      nodeRunner.run.mockResolvedValue(mockSuccessResult);

      const result = await service.runCodeTests({
        code: 'function add(a, b) { return a + b; }',
        language: Language.JAVASCRIPT,
        runtime: Runtime.NODE,
        testCases: [{ args: [2, 3], expected: 5, hidden: false }],
        entryFunction: 'add',
        timeoutMs: 3000,
      });

      expect(nodeRunner.run).toHaveBeenCalled();
      expect(result.overallPassed).toBe(true);
    });

    it('should route to PythonRunner for python runtime', async () => {
      pythonRunner.run.mockResolvedValue(mockSuccessResult);

      const result = await service.runCodeTests({
        code: 'def add(a, b): return a + b',
        language: Language.PYTHON,
        runtime: Runtime.PYTHON,
        testCases: [{ args: [2, 3], expected: 5, hidden: false }],
        entryFunction: 'add',
        timeoutMs: 3000,
      });

      expect(pythonRunner.run).toHaveBeenCalled();
      expect(result.overallPassed).toBe(true);
    });

    it('should route to SqlRunner for sql runtime', async () => {
      sqlRunner.run.mockResolvedValue(mockSuccessResult);

      const result = await service.runCodeTests({
        code: 'SELECT * FROM users',
        language: Language.SQL,
        runtime: Runtime.SQL,
        testCases: [
          {
            args: [],
            expected: [],
            hidden: false,
            schemaSql: 'CREATE TABLE users (id INT)',
            expectedRows: [],
          },
        ],
        timeoutMs: 3000,
      });

      expect(sqlRunner.run).toHaveBeenCalled();
    });

    it('should throw error when entryFunction is missing for non-SQL runtime', async () => {
      await expect(
        service.runCodeTests({
          code: 'function add(a, b) { return a + b; }',
          language: Language.JAVASCRIPT,
          runtime: Runtime.NODE,
          testCases: [{ args: [2, 3], expected: 5, hidden: false }],
          // entryFunction missing!
          timeoutMs: 3000,
        }),
      ).rejects.toThrow('Entry function is required');
    });

    it('should not require entryFunction for SQL runtime', async () => {
      sqlRunner.run.mockResolvedValue(mockSuccessResult);

      // Should not throw
      await service.runCodeTests({
        code: 'SELECT 1',
        language: Language.SQL,
        runtime: Runtime.SQL,
        testCases: [{ args: [], expected: [], hidden: false }],
        // No entryFunction - this is OK for SQL
        timeoutMs: 3000,
      });

      expect(sqlRunner.run).toHaveBeenCalled();
    });
  });

  describe('gradeFillInBlanks', () => {
    it('should grade correct answers', () => {
      const result = service.gradeFillInBlanks(
        { blank1: 'hello', blank2: 'world' },
        [
          { id: 'blank1', correctAnswers: ['hello'], points: 1 },
          { id: 'blank2', correctAnswers: ['world'], points: 1 },
        ],
      );

      expect(result.allCorrect).toBe(true);
      expect(result.totalPoints).toBe(2);
    });

    it('should handle case insensitive matching', () => {
      const result = service.gradeFillInBlanks(
        { blank1: 'HELLO' },
        [{ id: 'blank1', correctAnswers: ['hello'], caseSensitive: false }],
      );

      expect(result.allCorrect).toBe(true);
    });

    it('should handle case sensitive matching', () => {
      const result = service.gradeFillInBlanks(
        { blank1: 'HELLO' },
        [{ id: 'blank1', correctAnswers: ['hello'], caseSensitive: true }],
      );

      expect(result.allCorrect).toBe(false);
    });

    it('should handle missing answers', () => {
      const result = service.gradeFillInBlanks(null, [
        { id: 'blank1', correctAnswers: ['hello'] },
      ]);

      expect(result.allCorrect).toBe(false);
      expect(result.totalPoints).toBe(0);
    });
  });

  describe('getSupportedConfigurations', () => {
    it('should return all supported runtimes and languages', () => {
      const config = service.getSupportedConfigurations();

      expect(config.supportedRuntimes).toContain(Runtime.NODE);
      expect(config.supportedRuntimes).toContain(Runtime.PYTHON);
      expect(config.supportedRuntimes).toContain(Runtime.SQL);
      expect(config.supportedRuntimes).toContain(Runtime.DART);

      expect(config.supportedLanguages).toContain(Language.JAVASCRIPT);
      expect(config.supportedLanguages).toContain(Language.TYPESCRIPT);
      expect(config.supportedLanguages).toContain(Language.PYTHON);
    });

    it('should map languages to correct runtimes', () => {
      const config = service.getSupportedConfigurations();

      expect(config.languageRuntimeMap[Language.JAVASCRIPT]).toBe(Runtime.NODE);
      expect(config.languageRuntimeMap[Language.PYTHON]).toBe(Runtime.PYTHON);
      expect(config.languageRuntimeMap[Language.SQL]).toBe(Runtime.SQL);
      expect(config.languageRuntimeMap[Language.DART]).toBe(Runtime.DART);
    });
  });
});
