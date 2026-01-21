// src/test-session/services/question-handler.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TestSession, TestSessionDocument } from '../../schemas/test-session.schema';
import { SubmitAnswerDto } from '../dto/test-session.dto';

/**
 * QuestionHandlerService - Simplified section-relative navigation
 *
 * Key design principles:
 * 1. currentQuestionIndex is SECTION-RELATIVE (0-based within current section)
 * 2. Each section has its own status: not_started, in_progress, reviewing, submitted
 * 3. Submit answer ALWAYS advances to next question (no action parameter needed)
 * 4. When reaching end of section, transitions to 'reviewing' state
 * 5. User can navigate freely during review, then submit the section
 */
@Injectable()
export class QuestionHandlerService {
  constructor(
    @InjectModel(TestSession.name) private testSessionModel: Model<TestSessionDocument>,
  ) {}

  /**
   * Get current question state and navigation context
   */
  async getCurrentQuestion(sessionId: string): Promise<any> {
    const session = await this.getActiveSession(sessionId);
    const question = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);

    if (!question) {
      throw new NotFoundException('Current question not found');
    }

    // Mark as viewed if first time
    if (question.status === 'not_viewed') {
      question.status = 'viewed';
      question.firstViewedAt = new Date();
    }
    question.viewCount = (question.viewCount || 0) + 1;
    question.lastViewedAt = new Date();
    await session.save();

    return {
      questionState: this.buildQuestionState(session, question),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  /**
   * Submit answer - ALWAYS advances to next question unless at section end
   */
  async submitAnswer(sessionId: string, answerData: SubmitAnswerDto): Promise<any> {
    const session = await this.getActiveSession(sessionId);

    // Check time
    const timeRemaining = (session as any).calculateTimeRemaining?.() || 0;
    if (timeRemaining <= 0) {
      return { action: 'time_expired', message: 'Session time has expired' };
    }

    // Get current question
    const question = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);
    if (!question) {
      throw new NotFoundException('Current question not found');
    }

    // Save the answer
    if (answerData.answer !== undefined) {
      question.studentAnswer = answerData.answer;
      question.status = 'answered';
      question.lastViewedAt = new Date();

      // Track in answeredQuestions (using global index for backward compat)
      const globalIndex = this.toGlobalIndex(session, session.currentSectionIndex, session.currentQuestionIndex);
      if (!session.answeredQuestions.includes(globalIndex)) {
        session.answeredQuestions.push(globalIndex);
      }

      // Remove from skipped if it was there
      const skippedIdx = session.skippedQuestions.indexOf(globalIndex);
      if (skippedIdx !== -1) {
        session.skippedQuestions.splice(skippedIdx, 1);
      }

      if (answerData.timeSpent) {
        question.timeSpentOnQuestion = (question.timeSpentOnQuestion || 0) + answerData.timeSpent;
      }
    }

    session.lastServerAction = 'answer_submitted';
    session.lastServerActionAt = new Date();

    // Determine what happens next
    const isLastInSection = this.isLastQuestionInSection(session);
    const useSections = session.testSnapshot.settings.useSections;

    // If in review mode, stay on current question after saving
    if (session.reviewPhase || this.getCurrentSectionStatus(session) === 'reviewing') {
      await session.save();
      return {
        action: 'answer_saved',
        questionState: this.buildQuestionState(session, question),
        navigationContext: this.buildNavigationContext(session),
      };
    }

    // Not last question - advance to next
    if (!isLastInSection) {
      session.currentQuestionIndex++;

      // Mark next question as viewed (single save for both operations)
      const nextQuestion = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);
      if (nextQuestion && nextQuestion.status === 'not_viewed') {
        nextQuestion.status = 'viewed';
        nextQuestion.firstViewedAt = new Date();
      }

      await session.save(); // Single save for index update + viewed status

      return {
        action: 'next_question',
        questionState: this.buildQuestionState(session, nextQuestion),
        navigationContext: this.buildNavigationContext(session),
      };
    }

    // Last question in section - transition to review
    if (useSections) {
      this.setCurrentSectionStatus(session, 'reviewing');
      await session.save();

      return {
        action: 'section_review',
        message: `You've reached the end of ${this.getCurrentSectionName(session)}. Review your answers before submitting.`,
        sectionIndex: session.currentSectionIndex,
        sectionName: this.getCurrentSectionName(session),
        questionState: this.buildQuestionState(session, question),
        navigationContext: this.buildNavigationContext(session),
        sectionSummary: this.buildSectionSummary(session),
      };
    }

    // Non-sectioned test - check for unanswered questions
    const unansweredCount = this.countUnansweredInCurrentSection(session);
    if (unansweredCount > 0) {
      await session.save();
      return {
        action: 'confirm_submit',
        message: `You have ${unansweredCount} unanswered question(s). Review before submitting?`,
        unansweredCount,
        questionState: this.buildQuestionState(session, question),
        navigationContext: this.buildNavigationContext(session),
      };
    }

    // All questions answered in non-sectioned test
    await session.save();
    return {
      action: 'test_complete',
      message: 'All questions answered. Ready to submit.',
      questionState: this.buildQuestionState(session, question),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  /**
   * Navigate to specific question within current section
   */
  async navigateToQuestion(sessionId: string, questionIndex: number): Promise<any> {
    const session = await this.getActiveSession(sessionId);

    const sectionQuestionCount = this.getQuestionCountInCurrentSection(session);
    if (questionIndex < 0 || questionIndex >= sectionQuestionCount) {
      throw new BadRequestException(
        `Invalid question index: ${questionIndex}. Valid range: 0-${sectionQuestionCount - 1}`
      );
    }

    session.currentQuestionIndex = questionIndex;
    session.lastServerAction = `navigated_to_${questionIndex}`;
    session.lastServerActionAt = new Date();

    const question = this.getQuestionAt(session, session.currentSectionIndex, questionIndex);
    if (question) {
      if (question.status === 'not_viewed') {
        question.status = 'viewed';
        question.firstViewedAt = new Date();
      }
      question.viewCount = (question.viewCount || 0) + 1;
      question.lastViewedAt = new Date();
    }

    await session.save();

    return {
      questionState: this.buildQuestionState(session, question),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  /**
   * Skip current question and move to next
   */
  async skipQuestion(sessionId: string): Promise<any> {
    const session = await this.getActiveSession(sessionId);

    const question = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);
    if (question) {
      question.status = 'skipped';
      question.studentAnswer = null;
    }

    const globalIndex = this.toGlobalIndex(session, session.currentSectionIndex, session.currentQuestionIndex);
    if (!session.skippedQuestions.includes(globalIndex)) {
      session.skippedQuestions.push(globalIndex);
    }

    // Remove from answered if it was there
    const answeredIdx = session.answeredQuestions.indexOf(globalIndex);
    if (answeredIdx !== -1) {
      session.answeredQuestions.splice(answeredIdx, 1);
    }

    // Advance to next if not at end
    const isLastInSection = this.isLastQuestionInSection(session);
    if (!isLastInSection) {
      session.currentQuestionIndex++;
    }

    await session.save();

    const nextQuestion = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);
    return {
      action: isLastInSection ? 'at_section_end' : 'next_question',
      questionState: this.buildQuestionState(session, nextQuestion),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  /**
   * Submit current section (for sectioned tests)
   */
  async submitSection(sessionId: string): Promise<any> {
    const session = await this.getActiveSession(sessionId);

    if (!session.testSnapshot.settings.useSections) {
      throw new BadRequestException('This test does not use sections');
    }

    const currentStatus = this.getCurrentSectionStatus(session);
    if (currentStatus !== 'reviewing' && currentStatus !== 'in_progress') {
      throw new BadRequestException(`Cannot submit section with status: ${currentStatus}`);
    }

    // Mark section as submitted
    this.setCurrentSectionStatus(session, 'submitted');
    if (!session.completedSections.includes(session.currentSectionIndex)) {
      session.completedSections.push(session.currentSectionIndex);
    }

    const isLastSection = this.isLastSection(session);

    if (isLastSection) {
      // All sections complete
      await session.save();
      return {
        action: 'test_complete',
        message: 'All sections completed. Ready to submit test.',
        completedSections: session.completedSections,
      };
    }

    // Move to next section
    session.currentSectionIndex++;
    session.currentQuestionIndex = 0;

    // Initialize next section
    const nextSection = session.testSnapshot.sections[session.currentSectionIndex];
    if (nextSection) {
      nextSection.status = 'in_progress';
      nextSection.startedAt = new Date();
    }

    session.currentSectionStartedAt = new Date();
    session.lastServerAction = 'section_submitted';
    session.lastServerActionAt = new Date();

    await session.save();

    const firstQuestion = this.getQuestionAt(session, session.currentSectionIndex, 0);
    return {
      action: 'next_section',
      message: `Section submitted. Starting ${nextSection?.name || `Section ${session.currentSectionIndex + 1}`}`,
      sectionIndex: session.currentSectionIndex,
      sectionName: nextSection?.name || `Section ${session.currentSectionIndex + 1}`,
      timeRemaining: (session as any).calculateTimeRemaining?.() || 0,
      questionState: this.buildQuestionState(session, firstQuestion),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  /**
   * Enter review mode for current section
   */
  async startSectionReview(sessionId: string): Promise<any> {
    const session = await this.getActiveSession(sessionId);

    if (session.testSnapshot.settings.useSections) {
      this.setCurrentSectionStatus(session, 'reviewing');
    }
    session.reviewPhase = true;
    session.reviewStartedAt = new Date();
    session.lastServerAction = 'review_started';
    session.lastServerActionAt = new Date();

    await session.save();

    const question = this.getQuestionAt(session, session.currentSectionIndex, session.currentQuestionIndex);
    return {
      action: 'review_started',
      message: 'Review mode started. Navigate to any question to review or change your answer.',
      sectionSummary: this.buildSectionSummary(session),
      questionState: this.buildQuestionState(session, question),
      navigationContext: this.buildNavigationContext(session),
    };
  }

  // ============================================
  // Helper methods
  // ============================================

  private async getActiveSession(sessionId: string): Promise<TestSessionDocument> {
    const session = await this.testSessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.status !== 'inProgress' && session.status !== 'paused') {
      throw new BadRequestException(`Session is not active. Status: ${session.status}`);
    }
    return session;
  }

  private getQuestionAt(session: TestSessionDocument, sectionIndex: number, questionIndex: number): any {
    if (session.testSnapshot.settings.useSections) {
      const section = session.testSnapshot.sections?.[sectionIndex];
      return section?.questions?.[questionIndex] || null;
    }
    return session.testSnapshot.questions?.[questionIndex] || null;
  }

  private getQuestionCountInCurrentSection(session: TestSessionDocument): number {
    if (session.testSnapshot.settings.useSections) {
      const section = session.testSnapshot.sections?.[session.currentSectionIndex];
      return section?.questions?.length || 0;
    }
    return session.testSnapshot.questions?.length || 0;
  }

  private isLastQuestionInSection(session: TestSessionDocument): boolean {
    const count = this.getQuestionCountInCurrentSection(session);
    return session.currentQuestionIndex >= count - 1;
  }

  private isLastSection(session: TestSessionDocument): boolean {
    if (!session.testSnapshot.settings.useSections) return true;
    return session.currentSectionIndex >= session.testSnapshot.sections.length - 1;
  }

  private getCurrentSectionStatus(session: TestSessionDocument): string {
    if (!session.testSnapshot.settings.useSections) return 'in_progress';
    const section = session.testSnapshot.sections?.[session.currentSectionIndex];
    return section?.status || 'in_progress';
  }

  private setCurrentSectionStatus(session: TestSessionDocument, status: string): void {
    if (!session.testSnapshot.settings.useSections) return;
    const section = session.testSnapshot.sections?.[session.currentSectionIndex];
    if (section) {
      section.status = status;
      if (status === 'submitted') {
        section.submittedAt = new Date();
      }
    }
  }

  private getCurrentSectionName(session: TestSessionDocument): string {
    if (!session.testSnapshot.settings.useSections) return 'Test';
    const section = session.testSnapshot.sections?.[session.currentSectionIndex];
    return section?.name || `Section ${session.currentSectionIndex + 1}`;
  }

  private toGlobalIndex(session: TestSessionDocument, sectionIndex: number, questionIndex: number): number {
    if (!session.testSnapshot.settings.useSections) return questionIndex;
    let globalIndex = 0;
    for (let i = 0; i < sectionIndex; i++) {
      globalIndex += session.testSnapshot.sections[i]?.questions?.length || 0;
    }
    return globalIndex + questionIndex;
  }

  private countUnansweredInCurrentSection(session: TestSessionDocument): number {
    const questions = session.testSnapshot.settings.useSections
      ? session.testSnapshot.sections?.[session.currentSectionIndex]?.questions || []
      : session.testSnapshot.questions || [];

    return questions.filter((q: any) =>
      q.status !== 'answered' && q.studentAnswer === null
    ).length;
  }

  private buildQuestionState(session: TestSessionDocument, question: any): any {
    if (!question) return null;

    // Filter question data for student view (hide answers)
    const safeQuestionData: any = {};
    const safeFields = ['title', 'description', 'type', 'language', 'difficulty', 'tags', 'category',
                        'options', 'codeTemplate', 'blanks', 'buggyCode', 'codeConfig', 'testCases'];

    for (const field of safeFields) {
      if (question.questionData?.[field] !== undefined) {
        safeQuestionData[field] = question.questionData[field];
      }
    }

    // Filter hidden test cases
    if (safeQuestionData.testCases && Array.isArray(safeQuestionData.testCases)) {
      safeQuestionData.testCases = safeQuestionData.testCases.filter((tc: any) => !tc?.hidden);
    }

    return {
      questionIndex: session.currentQuestionIndex,
      questionId: question.questionId,
      questionData: safeQuestionData,
      points: question.points || 0,
      status: question.status || 'not_viewed',
      studentAnswer: question.studentAnswer,
      timeSpent: question.timeSpentOnQuestion || 0,
    };
  }

  private buildNavigationContext(session: TestSessionDocument): any {
    const useSections = session.testSnapshot.settings.useSections;
    const questionCount = this.getQuestionCountInCurrentSection(session);
    const sectionStatus = this.getCurrentSectionStatus(session);

    const context: any = {
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestionsInSection: questionCount,
      canGoBack: session.currentQuestionIndex > 0,
      canGoForward: session.currentQuestionIndex < questionCount - 1,
      isLastQuestion: session.currentQuestionIndex >= questionCount - 1,
      isReviewing: sectionStatus === 'reviewing' || session.reviewPhase,
      timeRemaining: (session as any).calculateTimeRemaining?.() || 0,
    };

    if (useSections) {
      const section = session.testSnapshot.sections?.[session.currentSectionIndex];
      context.currentSection = {
        index: session.currentSectionIndex,
        name: section?.name || `Section ${session.currentSectionIndex + 1}`,
        status: section?.status || 'in_progress',
        questionCount,
      };
      context.totalSections = session.testSnapshot.sections.length;
      context.isLastSection = this.isLastSection(session);
      context.completedSections = session.completedSections || [];
    }

    return context;
  }

  private buildSectionSummary(session: TestSessionDocument): any {
    const questions = session.testSnapshot.settings.useSections
      ? session.testSnapshot.sections?.[session.currentSectionIndex]?.questions || []
      : session.testSnapshot.questions || [];

    // Single pass to count all statuses
    let answered = 0, skipped = 0, notViewed = 0, viewed = 0;
    const questionStatuses: any[] = [];

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      const status = q.status || 'not_viewed';

      if (status === 'answered') answered++;
      else if (status === 'skipped') skipped++;
      else if (status === 'not_viewed') notViewed++;
      else if (status === 'viewed') viewed++;

      questionStatuses.push({
        index: idx,
        status,
        hasAnswer: q.studentAnswer !== null && q.studentAnswer !== undefined,
      });
    }

    return {
      totalQuestions: questions.length,
      answered,
      skipped,
      viewed,
      notViewed,
      unanswered: questions.length - answered,
      questionStatuses,
    };
  }
}
