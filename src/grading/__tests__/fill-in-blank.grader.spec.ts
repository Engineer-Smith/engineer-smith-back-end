import { FillInBlankGraderService } from '../graders/fill-in-blank.grader';

describe('FillInBlankGraderService', () => {
  let service: FillInBlankGraderService;

  beforeEach(() => {
    service = new FillInBlankGraderService();
  });

  describe('grade', () => {
    it('should return all correct when all answers match', () => {
      const result = service.grade(
        { blank1: 'answer1', blank2: 'answer2' },
        [
          { id: 'blank1', correctAnswers: ['answer1'], points: 1 },
          { id: 'blank2', correctAnswers: ['answer2'], points: 2 },
        ],
      );

      expect(result.allCorrect).toBe(true);
      expect(result.totalPoints).toBe(3);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].isCorrect).toBe(true);
      expect(result.results[1].isCorrect).toBe(true);
    });

    it('should handle multiple correct answers per blank', () => {
      const result = service.grade(
        { blank1: 'option2' },
        [{ id: 'blank1', correctAnswers: ['option1', 'option2', 'option3'] }],
      );

      expect(result.allCorrect).toBe(true);
    });

    it('should be case insensitive when configured', () => {
      const result = service.grade(
        { blank1: 'HELLO' },
        [{ id: 'blank1', correctAnswers: ['hello'], caseSensitive: false }],
      );

      expect(result.allCorrect).toBe(true);
    });

    it('should be case sensitive by default', () => {
      const result = service.grade(
        { blank1: 'HELLO' },
        [{ id: 'blank1', correctAnswers: ['hello'] }],
      );

      expect(result.allCorrect).toBe(false);
    });

    it('should handle empty answers object', () => {
      const result = service.grade(null, [
        { id: 'blank1', correctAnswers: ['answer'], points: 5 },
      ]);

      expect(result.allCorrect).toBe(false);
      expect(result.totalPoints).toBe(0);
      expect(result.totalPossiblePoints).toBe(5);
    });

    it('should handle empty blanks array', () => {
      const result = service.grade({ blank1: 'answer' }, []);

      expect(result.allCorrect).toBe(false);
      expect(result.results).toHaveLength(0);
    });

    it('should trim whitespace from answers', () => {
      const result = service.grade(
        { blank1: '  answer  ' },
        [{ id: 'blank1', correctAnswers: ['answer'] }],
      );

      expect(result.allCorrect).toBe(true);
    });

    it('should return partial results when some answers are wrong', () => {
      const result = service.grade(
        { blank1: 'correct', blank2: 'wrong' },
        [
          { id: 'blank1', correctAnswers: ['correct'], points: 1 },
          { id: 'blank2', correctAnswers: ['right'], points: 1 },
        ],
      );

      expect(result.allCorrect).toBe(false);
      expect(result.totalPoints).toBe(1);
      expect(result.results[0].isCorrect).toBe(true);
      expect(result.results[1].isCorrect).toBe(false);
    });

    it('should use default points of 1 when not specified', () => {
      const result = service.grade(
        { blank1: 'answer' },
        [{ id: 'blank1', correctAnswers: ['answer'] }],
      );

      expect(result.totalPoints).toBe(1);
      expect(result.totalPossiblePoints).toBe(1);
    });
  });

  describe('validateConfig', () => {
    it('should pass for valid configuration', () => {
      expect(() =>
        service.validateConfig([
          { id: 'blank1', correctAnswers: ['answer1'] },
          { id: 'blank2', correctAnswers: ['answer2', 'answer3'] },
        ]),
      ).not.toThrow();
    });

    it('should throw for non-array input', () => {
      expect(() => service.validateConfig('not an array' as any)).toThrow(
        'Blanks must be an array',
      );
    });

    it('should throw for blank without id', () => {
      expect(() =>
        service.validateConfig([{ correctAnswers: ['answer'] } as any]),
      ).toThrow('must have a valid string id');
    });

    it('should throw for blank without correct answers', () => {
      expect(() =>
        service.validateConfig([{ id: 'blank1' } as any]),
      ).toThrow('must have at least one correct answer');
    });

    it('should throw for empty correct answers array', () => {
      expect(() =>
        service.validateConfig([{ id: 'blank1', correctAnswers: [] }]),
      ).toThrow('must have at least one correct answer');
    });

    it('should throw for non-string correct answer', () => {
      expect(() =>
        service.validateConfig([
          { id: 'blank1', correctAnswers: [123 as any] },
        ]),
      ).toThrow('must be a string');
    });

    it('should throw for negative points', () => {
      expect(() =>
        service.validateConfig([
          { id: 'blank1', correctAnswers: ['answer'], points: -1 },
        ]),
      ).toThrow('must be a non-negative number');
    });
  });
});
