// =====================================================
// src/services/ApiService.ts - UPDATED for server-driven architecture
// =====================================================

import type { AxiosInstance } from 'axios';
import axios from 'axios';
import type {
  CheckExistingSessionResponse,
  CurrentQuestionResponse,
  Question,
  QuestionTestResult,
  RejoinSessionResponse,
  Result,
  ResultAnalytics,
  SectionAnalytics,
  // NEW: Server-driven types
  ServerActionResponse,
  StartSessionConflictResponse,
  StartSessionResponse,
  SubmitAnswerRequest,
  Test,
  TestSession,
  User,
  UserAnalytics,
  UserDetailsDashboard,
  UserManagementDashboard
} from '../types/';



import type { PopulatedSession } from '../pages/LiveSessionMonitor';
import type { PopulatedResult } from '../types/result';

import type { StudentDashboard } from '../types/student';

interface Params {
  [key: string]: string | number | boolean | undefined;
}

interface QuestionsResponse {
  questions: Question[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    totalCount?: number;
  };
}

// =====================================================
// REMOVED: ApiResponse wrapper - Server returns data directly
// =====================================================

// =====================================================
// API SERVICE CLASS - UPDATED FOR SERVER-DRIVEN ARCHITECTURE
// =====================================================

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',  // <-- Add /api prefix
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config.url?.includes('/auth/me')) {
          return Promise.reject(error);
        }

        if (error.response?.status === 401 && !error.config._retry) {
          error.config._retry = true;
          try {
            const refreshResponse = await axios.post(
              '/api/auth/refresh-token',  // <-- Explicit /api prefix
              {},
              { withCredentials: true }
            );

            if (refreshResponse.status === 200) {
              if (refreshResponse.data.csrfToken) {
                document.cookie = `csrfToken=${refreshResponse.data.csrfToken}; path=/; SameSite=Strict; ${import.meta.env.PROD ? 'Secure' : ''}`;
              }
              await new Promise((resolve) => setTimeout(resolve, 100));
              error.config.headers['X-CSRF-Token'] = refreshResponse.data.csrfToken || this.getCsrfToken();
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            console.error('ApiService: Token refresh failed:', refreshError);
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getCsrfToken(): string | null {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : null;
  }

  private getCsrfHeaders(): { 'X-CSRF-Token'?: string } {
    const csrfToken = this.getCsrfToken();
    return csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  }

  // =====================================================
  // AUTHENTICATION APIs - SIMPLIFIED (no ApiResponse wrapper)
  // =====================================================

  async register(data: {
    username: string;
    firstName: string;
    lastName: string;
    email?: string;
    password?: string;
    inviteCode?: string;
    role?: string;
  }): Promise<{ success: boolean; user: User; csrfToken: string }> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: { loginCredential: string; password: string }): Promise<{ success: boolean; user: User; csrfToken: string }> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/auth/logout', {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async refreshToken(): Promise<{ success: boolean; csrfToken: string }> {
    const response = await this.client.post('/auth/refresh-token');
    return response.data;
  }

  async validateInviteCode(data: { inviteCode: string }): Promise<{ success: boolean; organization: { _id: string; name: string } }> {
    const response = await this.client.post('/auth/validate-invite', data);
    return response.data;
  }

  getSSOLoginUrl(): string {
    return 'https://engineer-smith-back-end.onrender.com/auth/login/sso';
  }

  async checkAuthStatus(): Promise<{ success: boolean; authenticated: boolean; user?: User }> {
    const response = await this.client.get('/auth/status');
    return response.data;
  }

  // =====================================================
  // USER MANAGEMENT - SIMPLIFIED (no ApiResponse wrapper)
  // =====================================================

  async getUser(userId: string): Promise<User> {
    const response = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async getAllUsers(params: Params = {}): Promise<User[]> {
    const response = await this.client.get('/users', { params });
    return response.data?.users || [];
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const response = await this.client.patch(`/users/${userId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/users/${userId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createUser(userData: {
    loginId: string;
    password: string;
    firstName: string;
    lastName: string;
    email?: string;
    role: 'student' | 'instructor' | 'admin';
  }): Promise<User> {
    const response = await this.client.post('/users', userData, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // CURRENT USER PROFILE & PREFERENCES
  // =====================================================

  async getCurrentUserProfile(): Promise<User> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateCurrentUserProfile(data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const response = await this.client.patch('/users/me', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getUserPreferences(): Promise<{
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    testReminders: boolean;
    codeEditorFontSize: number;
    codeEditorTheme: string;
  }> {
    const response = await this.client.get('/users/me/preferences');
    return response.data;
  }

  async updateUserPreferences(data: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    testReminders?: boolean;
    codeEditorFontSize?: number;
    codeEditorTheme?: string;
  }): Promise<{
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    testReminders: boolean;
    codeEditorFontSize: number;
    codeEditorTheme: string;
  }> {
    const response = await this.client.patch('/users/me/preferences', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response = await this.client.post('/auth/change-password', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // QUESTION MANAGEMENT - TYPE-SPECIFIC ENDPOINTS
  // =====================================================

  // Legacy generic endpoint (still supported)
  async createQuestion(data: Partial<Question>, params: Params = {}): Promise<Question> {
    const response = await this.client.post('/questions', data, {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Type-specific create endpoints
  async createMultipleChoiceQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    options: string[];
    correctAnswer: number;
    category?: string;
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/multiple-choice', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createTrueFalseQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    correctAnswer: number; // 0 for True, 1 for False
    category?: string;
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/true-false', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createFillInBlankQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeTemplate: string;
    blanks: Array<{
      id: string;
      correctAnswers: string[];
      hint?: string;
    }>;
    category?: string;
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/fill-in-blank', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createDragDropClozeQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeTemplate: string;
    blanks: Array<{
      id: string;
      correctAnswers: string[];
      hint?: string;
      points?: number;
    }>;
    dragOptions: Array<{
      id: string;
      text: string;
    }>;
    category?: string;
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/drag-drop-cloze', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createCodeChallengeQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeConfig: {
      entryFunction: string;
      runtime?: string;
    };
    testCases: Array<{
      args: any[];
      expected: any;
      isHidden?: boolean;
      description?: string;
      // SQL-specific
      schemaSql?: string;
      seedSql?: string;
      expectedRows?: any[];
    }>;
    starterCode?: string;
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/code-challenge', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async createCodeDebuggingQuestion(data: {
    title: string;
    description: string;
    language: string;
    difficulty: string;
    buggyCode: string;
    solutionCode: string;
    codeConfig: {
      entryFunction: string;
      runtime?: string;
    };
    testCases: Array<{
      args: any[];
      expected: any;
      isHidden?: boolean;
      description?: string;
    }>;
    hints?: string[];
    status?: string;
    isGlobal?: boolean;
    tags?: string[];
  }): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.post('/questions/code-debugging', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async checkDuplicates(params: {
    title?: string;
    description?: string;
    type: string;
    language: string;
    category?: string;
    entryFunction?: string;
    codeTemplate?: string;
  }): Promise<{
    found: boolean;
    count: number;
    duplicates: Array<{
      _id: string;
      title: string;
      description: string;
      type: string;
      language: string;
      category?: string;
      difficulty: string;
      organizationId?: string;
      isGlobal: boolean;
      createdBy: string;
      createdAt: string;
      similarity: number;
      exactMatch: boolean;
      source: 'Global' | 'Your Organization';
      matchReason: string;
    }>;
    searchParams: {
      type: string;
      language: string;
      category?: string;
    };
  }> {
    const response = await this.client.get('/questions/check-duplicates', { params });
    return response.data;
  }

  async testQuestion(data: {
    questionData: {
      type: string;
      title?: string;
      description?: string;
      language: string;
      category: string;
      difficulty?: string;
      testCases?: Array<{
        name?: string;
        args: any[];
        expectedOutput?: any; // Backend expects expectedOutput, not expected
        hidden?: boolean;
      }>;
      codeConfig?: {
        runtime: string;
        entryFunction: string;
        timeoutMs?: number;
      };
      buggyCode?: string;
      solutionCode?: string;
    };
    testCode: string;
  }): Promise<QuestionTestResult> {
    const response = await this.client.post('/questions/test', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // NEW: Run code against test cases during a test session
  async runSessionCode(sessionId: string, code: string, questionIndex?: number): Promise<{
    success: boolean;
    testResults: Array<{
      testName: string;
      passed: boolean;
      input: any[];
      expected: any;
      actual: any;
      error: string | null;
      executionTime: number;
    }>;
    visiblePassed: number;
    visibleTotal: number;
    hasHiddenTests: boolean;
    consoleLogs: string[];
    executionError: string | null;
    compilationError: string | null;
  }> {
    const response = await this.client.post(`/test-sessions/${sessionId}/run-code`, {
      code,
      ...(questionIndex !== undefined && { questionIndex })
    }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getQuestion(questionId: string): Promise<Question> {
    const response = await this.client.get(`/questions/${questionId}`);
    return response.data;
  }

  async getAllQuestions(
    params: Params = {},
    includeTotalCount: boolean = false
  ): Promise<QuestionsResponse> {
    const queryParams = {
      ...params,
      ...(includeTotalCount && { includeTotalCount: 'true' })
    };

    const response = await this.client.get('/questions', { params: queryParams });
    const data = response.data || {};

    // Always return consistent format
    if (includeTotalCount) {
      // Backend returns the structured format
      return {
        questions: data.questions || [],
        pagination: {
          skip: data.pagination?.skip || 0,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          totalCount: data.pagination?.totalCount || 0
        }
      };
    } else {
      // Backend returns array - wrap it in consistent format
      const questions = Array.isArray(data) ? data : (data.questions || []);
      return {
        questions,
        pagination: {
          skip: parseInt(params.skip as string) || 0,
          limit: parseInt(params.limit as string) || 10,
          total: questions.length,
          totalCount: questions.length
        }
      };
    }
  }

  async getPaginatedQuestions(params: Params = {}): Promise<{
    questions: Question[];
    totalCount: number;
    totalPages: number;
  }> {
    const response = await this.getAllQuestions(params, true);
    return {
      questions: response.questions,
      totalCount: response.pagination.totalCount || 0,
      totalPages: Math.ceil((response.pagination.totalCount || 0) / (response.pagination.limit || 10))
    };
  }

  // Type-specific update endpoints
  async updateMultipleChoiceQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    options: string[];
    correctAnswer: number;
    category: string;
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/multiple-choice`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async updateTrueFalseQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    correctAnswer: number;
    category: string;
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/true-false`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async updateFillInBlankQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeTemplate: string;
    blanks: Array<{ id: string; correctAnswers: string[]; hint?: string }>;
    category: string;
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/fill-in-blank`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async updateDragDropClozeQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeTemplate: string;
    blanks: Array<{ id: string; correctAnswers: string[]; hint?: string; points?: number }>;
    dragOptions: Array<{ id: string; text: string }>;
    category: string;
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/drag-drop-cloze`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async updateCodeChallengeQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    codeConfig: { entryFunction: string; runtime?: string };
    testCases: Array<{ args: any[]; expected: any; isHidden?: boolean; description?: string }>;
    starterCode: string;
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/code-challenge`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async updateCodeDebuggingQuestion(questionId: string, data: Partial<{
    title: string;
    description: string;
    language: string;
    difficulty: string;
    buggyCode: string;
    solutionCode: string;
    codeConfig: { entryFunction: string; runtime?: string };
    testCases: Array<{ args: any[]; expected: any; isHidden?: boolean; description?: string }>;
    hints: string[];
    status: string;
    tags: string[];
  }>): Promise<{ success: boolean; message: string; question: Question }> {
    const response = await this.client.patch(`/questions/${questionId}/code-debugging`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Generic update - routes to type-specific endpoint based on question type
  async updateQuestion(questionId: string, data: Partial<Question>, questionType?: string): Promise<Question> {
    // If type provided, use type-specific endpoint
    if (questionType) {
      const typeEndpoints: Record<string, string> = {
        'multipleChoice': 'multiple-choice',
        'trueFalse': 'true-false',
        'fillInTheBlank': 'fill-in-blank',
        'dragDropCloze': 'drag-drop-cloze',
        'codeChallenge': 'code-challenge',
        'codeDebugging': 'code-debugging',
      };
      const endpoint = typeEndpoints[questionType];
      if (endpoint) {
        const response = await this.client.patch(`/questions/${questionId}/${endpoint}`, data, {
          headers: this.getCsrfHeaders(),
        });
        return response.data.question || response.data;
      }
    }
    // Fallback to legacy endpoint
    const response = await this.client.patch(`/questions/${questionId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteQuestion(questionId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/questions/${questionId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Question Import (Super Admin)
  async importQuestions(questions: Array<Partial<Question>>): Promise<{
    success: boolean;
    imported: number;
    failed: number;
    errors?: string[];
  }> {
    const response = await this.client.post('/questions/import', { questions }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Global Content (Super Admin)
  async getGlobalQuestions(params: Params = {}): Promise<Question[]> {
    const response = await this.client.get('/questions/global', { params });
    return response.data?.questions || response.data || [];
  }

  async getGlobalTests(params: Params = {}): Promise<Test[]> {
    const response = await this.client.get('/tests/global', { params });
    return response.data?.tests || response.data || [];
  }

  async getPopulatedTestSessions(params: any): Promise<PopulatedSession[]> {
    // This should call an endpoint that returns populated data
    const response = await this.client.get('/test-sessions', { params });
    return response.data;
  }

  async getQuestionStats(): Promise<{
    byLanguage: Array<{
      language: string;
      count: number;
      difficultyBreakdown: {
        easy: number;
        medium: number;
        hard: number;
      };
      typeBreakdown: {
        multipleChoice: number;
        trueFalse: number;
        codeChallenge: number;
        fillInTheBlank: number;
        codeDebugging: number;
        dragDropCloze: number;
      };
      categoryBreakdown: {
        logic: number;
        ui: number;
        syntax: number;
      };
    }>;
    totals: {
      totalQuestions: number;
      difficultyBreakdown: {
        easy: number;
        medium: number;
        hard: number;
      };
      typeBreakdown: {
        multipleChoice: number;
        trueFalse: number;
        codeChallenge: number;
        fillInTheBlank: number;
        codeDebugging: number;
        dragDropCloze: number;
      };
      categoryBreakdown: {
        logic: number;
        ui: number;
        syntax: number;
      };
    };
  }> {
    const response = await this.client.get('/questions/stats');
    return response.data;
  }

  // =====================================================
  // TEST MANAGEMENT - SIMPLIFIED  
  // =====================================================

  async createTest(data: Partial<Test>, params: Params = {}): Promise<Test> {
    const response = await this.client.post('/tests', data, {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTest(testId: string): Promise<Test> {
    const response = await this.client.get(`/tests/${testId}`);
    return response.data;
  }

  async getAllTests(params: Params = {}): Promise<Test[]> {
    const response = await this.client.get('/tests', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.tests || []);
  }

  async updateTest(testId: string, data: Partial<Test>): Promise<Test> {
    const response = await this.client.patch(`/tests/${testId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async deleteTest(testId: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/tests/${testId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTestWithQuestions(testId: string): Promise<Test> {
    const response = await this.client.get(`/tests/${testId}/with-questions`);
    return response.data;
  }

  // =====================================================
  // TEST SESSION MANAGEMENT - SERVER-DRIVEN ARCHITECTURE
  // =====================================================

  // Check if user has an existing active session
  async checkExistingSession(): Promise<CheckExistingSessionResponse> {
    const response = await this.client.get('/test-sessions/check-existing');
    return response.data;
  }

  // Rejoin an existing session
  async rejoinTestSession(sessionId: string): Promise<RejoinSessionResponse> {
    const response = await this.client.post(`/test-sessions/${sessionId}/rejoin`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Start session with conflict handling
  async startTestSession(data: { testId: string; forceNew?: boolean }): Promise<StartSessionResponse> {
    try {
      const response = await this.client.post('/test-sessions', data, {
        headers: this.getCsrfHeaders(),
      });
      return response.data;
    } catch (error: any) {
      // Handle 409 conflict specifically
      if (error.response?.status === 409) {
        const conflictData = error.response.data as StartSessionConflictResponse;
        throw {
          type: 'EXISTING_SESSION_CONFLICT',
          data: conflictData
        };
      }
      throw error;
    }
  }

  // Get current question (for manual refresh)
  async getCurrentQuestion(sessionId: string): Promise<CurrentQuestionResponse> {
    const response = await this.client.get(`/test-sessions/${sessionId}/current-question`);
    return response.data;
  }

  // =====================================================
  // NEW: SERVER-DRIVEN SUBMISSION (replaces all navigation methods)
  // =====================================================

  // Submit answer - SERVER DETERMINES NEXT ACTION
  async submitAnswer(sessionId: string, data: SubmitAnswerRequest): Promise<ServerActionResponse> {
    const response = await this.client.post(`/test-sessions/${sessionId}/submit-answer`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // SECTION-BASED NAVIGATION (NEW)
  // =====================================================

  // Submit current section and move to next (or complete test if last)
  async submitSection(sessionId: string): Promise<ServerActionResponse> {
    const response = await this.client.post(`/test-sessions/${sessionId}/submit-section`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Enter review mode for current section
  async startSectionReview(sessionId: string): Promise<ServerActionResponse> {
    const response = await this.client.post(`/test-sessions/${sessionId}/start-section-review`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Navigate to specific question (section-relative index) - only during review
  async navigateToQuestion(sessionId: string, questionIndex: number): Promise<ServerActionResponse> {
    const response = await this.client.post(`/test-sessions/${sessionId}/navigate`, { questionIndex }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // =====================================================
  // REMAINING SESSION METHODS - SIMPLIFIED
  // =====================================================

  async getSessionOverview(sessionId: string): Promise<any> {
    const response = await this.client.get(`/test-sessions/${sessionId}/overview`);
    return response.data;
  }

  async submitTestSession(sessionId: string, data: {
    forceSubmit?: boolean;
  } = {}): Promise<any> {
    const response = await this.client.post(`/test-sessions/${sessionId}/submit`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTestSession(sessionId: string): Promise<TestSession> {
    const response = await this.client.get(`/test-sessions/${sessionId}`);
    return response.data;
  }

  async getAllTestSessions(params: Params = {}): Promise<TestSession[]> {
    const response = await this.client.get('/test-sessions', { params });
    const data = response.data;
    return Array.isArray(data) ? data : (data?.sessions || []);
  }

  async abandonTestSession(sessionId: string): Promise<{ success: boolean; message: string; sessionId: string }> {
    const response = await this.client.post(`/test-sessions/${sessionId}/abandon`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getTimeSync(sessionId: string): Promise<any> {
    const response = await this.client.get(`/test-sessions/${sessionId}/time-sync`);
    return response.data;
  }

  // Analytics endpoints (for instructors/admins)
  async getSessionAnalytics(sessionId: string): Promise<any> {
    const response = await this.client.get(`/test-sessions/${sessionId}/analytics`);
    return response.data;
  }

  async getClassAnalytics(params: Params = {}): Promise<any> {
    const response = await this.client.get('/test-sessions/analytics/class', { params });
    return response.data;
  }

  // =====================================================
  // RESULTS - SIMPLIFIED
  // =====================================================

  async getResult(resultId: string): Promise<Result> {
    const response = await this.client.get(`/results/${resultId}`);
    return response.data;
  }

  async getAllResults(params: Params = {}): Promise<PopulatedResult[]> {
    const response = await this.client.get('/results', { params });
    // Handle both old array format and new paginated format
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.data || [];
  }

  async getAllResultsPaginated(params: Params = {}): Promise<{
    data: PopulatedResult[];
    pagination: {
      total: number;
      limit: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> {
    const response = await this.client.get('/results', { params });
    return response.data;
  }

  async getResultAnalytics(params: Params = {}): Promise<ResultAnalytics[]> {
    const response = await this.client.get('/results/analytics/results', { params });
    return response.data || [];
  }

  async getUserAnalytics(params: Params = {}): Promise<UserAnalytics[]> {
    const response = await this.client.get('/results/analytics/users', { params });
    return response.data || [];
  }

  async getSectionAnalytics(params: Params = {}): Promise<SectionAnalytics[]> {
    const response = await this.client.get('/results/analytics/sections', { params });
    return response.data || [];
  }

  async getQuestionAnalytics(params: Params = {}): Promise<Array<{
    questionId: string;
    questionTitle: string;
    questionType: string;
    language: string;
    category?: string;
    difficulty: string;
    totalAttempts: number;
    correctAttempts: number;
    successRate: number;
    averageTime: number;
    averagePoints: number;
  }>> {
    const response = await this.client.get('/results/analytics/questions', { params });
    return response.data || [];
  }

  // =====================================================
  // TAGS API METHODS - SIMPLIFIED
  // =====================================================

  async getTags(languages?: string[]): Promise<{
    success: boolean;
    error?: boolean;
    message?: string;
    data: {
      tagsByLanguage: Record<string, string[]>;
      tagMetadata: Record<string, { label: string; description: string; color?: string }>;
      allTags: string[];
    } | {
      applicableTags: string[];
      tagMetadata: Record<string, { label: string; description: string; color?: string }>;
    };
  }> {
    try {
      const params = languages ? { languages: languages.join(',') } : {};
      const response = await this.client.get('/tags', { params });
      return response.data; // Return the full response
    } catch (err: any) {
      // Handle 404 - tags endpoint doesn't exist on backend
      if (err?.response?.status === 404) {
        return {
          success: true,
          data: {
            tagsByLanguage: {},
            tagMetadata: {},
            allTags: []
          }
        };
      }
      throw err;
    }
  }

  async getTagsForLanguage(language: string): Promise<{
    language: string;
    tags: string[];
    metadata: Record<string, { label: string; description: string; color?: string }>;
  }> {
    const response = await this.client.get(`/tags/languages/${language}`);
    return {
      language: response.data.language,
      tags: response.data.tags,
      metadata: response.data.metadata
    };
  }

  async validateTags(tags: string[]): Promise<{
    allValid: boolean;
    validTags: string[];
    invalidTags: string[];
    validCount: number;
    invalidCount: number;
    totalCount: number;
  }> {
    const response = await this.client.post('/tags/validate', { tags }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data.validation;
  }

  async getTagMetadata(_tags?: string[]): Promise<Record<string, {
    label: string;
    description: string;
    color?: string
  }>> {
    // NOTE: No dedicated tags controller on backend - tags are constants
    console.warn('getTagsMetadata: Backend endpoint not implemented, returning empty');
    return {};
  }


  // =====================================================
  // ADMIN DASHBOARD APIS - NEW SECTION
  // =====================================================

  async getUserDashboard(params: Params = {}): Promise<UserManagementDashboard> {
    const response = await this.client.get('/admin/users/dashboard', { params });
    const data = response.data;
    // Ensure overview has required fields with defaults
    return {
      overview: {
        totalUsers: 0,
        roleDistribution: { admin: 0, instructor: 0, student: 0 },
        accountTypes: { sso: 0, regular: 0 },
        performance: null,
        ...data?.overview
      },
      recentActivity: data?.recentActivity || {},
      users: data?.users || {},
      content: {
        topQuestionCreators: data?.content?.topQuestionCreators || [],
        topTestCreators: data?.content?.topTestCreators || [],
      },
      organizations: data?.organizations || []
    };
  }

  async getUserDetailsDashboard(userId: string): Promise<UserDetailsDashboard> {
    const response = await this.client.get(`/admin/users/${userId}/dashboard`);
    return response.data;
  }

  // Additional admin user management methods
  async updateUserRole(userId: string, role: string): Promise<User> {
    const response = await this.client.patch(`/admin/users/${userId}/role`, { role }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async transferUserOrganization(userId: string, organizationId: string): Promise<User> {
    const response = await this.client.patch(`/admin/users/${userId}/organization`, { organizationId }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async resetUserPassword(userId: string): Promise<{ tempPassword: string }> {
    const response = await this.client.post(`/admin/users/${userId}/reset-password`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async bulkUpdateUsers(action: {
    type: 'delete' | 'changeRole' | 'transferOrganization' | 'export';
    userIds: string[];
    payload?: Record<string, any>;
  }): Promise<{ success: number; failed: number }> {
    const response = await this.client.post('/admin/users/bulk', action, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async exportUsers(options: {
    format: 'csv' | 'xlsx' | 'pdf';
    includePerformanceData: boolean;
    includeActivityLog: boolean;
    dateRange?: { start: string; end: string };
    userIds?: string[];
  }): Promise<{ downloadUrl: string }> {
    const response = await this.client.post('/admin/users/export', options, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Organization Management (Super Admin Only)
  async createOrganization(data: {
    name: string;
    isSuperOrg?: boolean;
  }): Promise<{
    _id: string;
    name: string;
    isSuperOrg: boolean;
    inviteCode: string;
  }> {
    const response = await this.client.post('/admin/organizations', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async getOrganizations(): Promise<Array<{
    _id: string;
    name: string;
    isSuperOrg: boolean;
    userCount: number;
    adminCount: number;
    instructorCount: number;
    studentCount: number;
  }>> {
    const response = await this.client.get('/admin/organizations');
    return response.data;
  }

  async getOrganization(orgId: string): Promise<{
    _id: string;
    name: string;
    isSuperOrg: boolean;
    inviteCode: string;
    createdAt: string;
  }> {
    const response = await this.client.get(`/admin/organizations/${orgId}`);
    return response.data;
  }

  async updateOrganization(orgId: string, data: {
    name?: string;
    isSuperOrg?: boolean;
  }): Promise<{ _id: string; name: string; isSuperOrg: boolean }> {
    const response = await this.client.patch(`/admin/organizations/${orgId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  async regenerateInviteCode(orgId: string): Promise<{ inviteCode: string }> {
    const response = await this.client.post(`/admin/organizations/${orgId}/regenerate-code`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  // Organization Settings
  async getOrganizationSettings(orgId: string): Promise<{
    allowSelfRegistration: boolean;
    defaultStudentAttemptsPerTest: number;
    testGracePeriodMinutes: number;
    requireEmailVerification: boolean;
    allowInstructorTestCreation: boolean;
    maxQuestionsPerTest: number;
    defaultTestTimeLimit: number;
  }> {
    const response = await this.client.get(`/organizations/${orgId}/settings`);
    return response.data;
  }

  async updateOrganizationSettings(orgId: string, data: {
    allowSelfRegistration?: boolean;
    defaultStudentAttemptsPerTest?: number;
    testGracePeriodMinutes?: number;
    requireEmailVerification?: boolean;
    allowInstructorTestCreation?: boolean;
    maxQuestionsPerTest?: number;
    defaultTestTimeLimit?: number;
  }): Promise<{
    allowSelfRegistration: boolean;
    defaultStudentAttemptsPerTest: number;
    testGracePeriodMinutes: number;
    requireEmailVerification: boolean;
    allowInstructorTestCreation: boolean;
    maxQuestionsPerTest: number;
    defaultTestTimeLimit: number;
  }> {
    const response = await this.client.patch(`/organizations/${orgId}/settings`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
 * Submit an attempt request via HTTP
 */
  async submitAttemptRequest(data: {
    testId: string;
    requestedAttempts: number;
    reason: string;
  }): Promise<{
    success: boolean;
    message: string;
    requestId: string;
  }> {
    const response = await this.client.post('/notifications/attempt-request', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Review an attempt request (instructor/admin only)
   */
  async reviewAttemptRequest(
    requestId: string,
    data: {
      decision: 'approved' | 'rejected';
      reviewNotes?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.post('/notifications/attempt-request/review', {
      requestId,
      ...data,
    }, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get pending attempt requests (for instructors/admins)
   */
  async getPendingAttemptRequests(): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending';
    createdAt: string;
    updatedAt: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    test: {
      _id: string;
      title: string;
      description: string;
    };
  }>> {
    const response = await this.client.get('/notifications/attempt-requests/pending');
    return response.data;
  }

  /**
   * Get user's own attempt requests
   */
  async getUserAttemptRequests(): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    test: {
      _id: string;
      title: string;
      description: string;
    };
    reviewer?: {
      _id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  }>> {
    const response = await this.client.get('/notifications/attempt-requests/my-requests');
    return response.data;
  }

  /**
   * Get specific attempt request details
   */
  async getAttemptRequest(requestId: string): Promise<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    requestedAttempts: number;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    test: {
      _id: string;
      title: string;
      description: string;
    };
    reviewer?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }> {
    const response = await this.client.get(`/notifications/attempt-requests/${requestId}`);
    return response.data;
  }

  /**
  * Grant attempts directly (admin/instructor only)
  */
  async grantAttemptsDirectly(data: {
    userId: string;
    testId: string;
    extraAttempts: number;
    reason: string;
  }): Promise<{
    success: boolean;
    message: string;
    override?: {
      _id: string;
      userId: string;
      testId: string;
      organizationId: string;
      extraAttempts: number;
      reason: string;
      grantedBy: string;
      grantedAt: string;
      expiresAt?: string;
    };
  }> {
    // FIXED: Use the correct endpoint that matches your server.js mounting
    const response = await this.client.post('/admin/grant-attempts', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get all overrides for organization
   */
  async getStudentOverrides(params?: {
    testId?: string;
    userId?: string;
  }): Promise<Array<{
    _id: string;
    userId: string;
    testId: string;
    organizationId: string;
    extraAttempts: number;
    reason: string;
    grantedBy: string;
    grantedAt: string;
    expiresAt?: string;
    user?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      fullName: string;
    };
    test?: {
      _id: string;
      title: string;
    };
    granter?: {
      _id: string;
      firstName: string;
      lastName: string;
      fullName: string;
    };
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.testId) searchParams.append('testId', params.testId);
    if (params?.userId) searchParams.append('userId', params.userId);

    const query = searchParams.toString();
    const endpoint = `/admin/overrides${query ? `?${query}` : ''}`;

    const response = await this.client.get(endpoint);
    // Handle both array directly or wrapped in object
    const data = response.data;
    return Array.isArray(data) ? data : (data?.overrides || []);
  }

  /**
   * Update an existing override
   */
  async updateStudentOverride(
    overrideId: string,
    data: { extraAttempts: number; reason: string }
  ): Promise<{
    success: boolean;
    message: string;
    override?: any;
  }> {
    const response = await this.client.patch(`/admin/overrides/${overrideId}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Delete an override
   */
  async deleteStudentOverride(overrideId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.delete(`/admin/overrides/${overrideId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get attempt request history
   */
  async getAttemptHistory(params?: {
    search?: string;
    status?: string;
    days?: number;
  }): Promise<Array<{
    _id: string;
    user: {
      _id: string;
      loginId: string;
      firstName: string;
      lastName: string;
    };
    test: {
      _id: string;
      title: string;
    };
    requestedAt: string;
    grantedAt?: string;
    grantedBy?: {
      _id: string;
      firstName: string;
      lastName: string;
    };
    reason: string;
    attemptsGranted: number;
    status: 'pending' | 'approved' | 'denied';
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.days) searchParams.append('days', params.days.toString());

    const query = searchParams.toString();
    const endpoint = `/admin/attempt-history${query ? `?${query}` : ''}`;

    const response = await this.client.get(endpoint);
    return Array.isArray(response.data) ? response.data : (response.data?.history || []);
  }

  /**
   * Get attempt status for a specific student/test combination
   */
  async getAttemptStatus(testId: string, userId: string): Promise<{
    student: {
      id: string;
      name: string;
      email: string;
    };
    test: {
      id: string;
      title: string;
      baseAttempts: number;
    };
    attempts: {
      total: number;
      used: number;
      remaining: number;
    };
    override?: {
      extraAttempts: number;
      reason: string;
      grantedBy: string;
      grantedAt: string;
    };
  }> {
    const response = await this.client.get(`/admin/status/${testId}/${userId}`);
    return response.data;
  }

  /**
   * Check if user can submit attempt request for a test
   */
  async canSubmitAttemptRequest(_testId: string): Promise<{
    canSubmit: boolean;
    reason?: string;
    remainingAttempts?: number;
    hasPendingRequest?: boolean;
  }> {
    // TODO: Backend needs this endpoint
    console.warn('canSubmitAttemptRequest: Backend endpoint not yet implemented');
    return { canSubmit: true };
  }

  /**
   * Get test attempt summary for a user
   */
  async getTestAttemptSummary(testId: string): Promise<{
    test: {
      id: string;
      title: string;
      baseAttempts: number;
    };
    attempts: {
      total: number;
      used: number;
      remaining: number;
    };
    hasOverride: boolean;
    hasPendingRequest: boolean;
    canTakeTest: boolean;
  }> {
    const response = await this.client.get(`/tests/${testId}/attempt-summary`);
    return response.data;
  }

  // =====================================================
  // NOTIFICATION API METHODS (HTTP fallback for socket)
  // =====================================================

  /**
   * Get user's notifications
   */
  async getNotifications(params?: {
    limit?: number;
    page?: number;
  }): Promise<{
    notifications: Array<{
      _id: string;
      recipientId: string;
      senderId?: string;
      organizationId: string;
      type: string;
      title: string;
      message: string;
      relatedModel?: string;
      relatedId?: string;
      actionUrl?: string;
      actionText?: string;
      isRead: boolean;
      readAt?: string;
      createdAt: string;
      updatedAt: string;
      sender?: {
        _id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    pagination: {
      current: number;
      total: number;
      hasNext: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.page) searchParams.append('page', params.page.toString());

    const query = searchParams.toString();
    const endpoint = `/notifications${query ? `?${query}` : ''}`;

    const response = await this.client.get(endpoint);
    // Ensure we return the expected structure even if backend format differs
    const data = response.data;
    let notifications = [];
    if (Array.isArray(data?.notifications)) {
      notifications = data.notifications;
    } else if (Array.isArray(data)) {
      notifications = data;
    }
    return {
      notifications,
      pagination: data?.pagination || { current: 1, total: 1, hasNext: false }
    };
  }

  /**
   * Mark notification as read via HTTP
   */
  async markNotificationAsRead(notificationId: string): Promise<{
    success: boolean;
  }> {
    const response = await this.client.patch(`/notifications/${notificationId}/read`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Mark all notifications as read via HTTP
   */
  async markAllNotificationsAsRead(): Promise<{
    success: boolean;
    markedCount: number;
  }> {
    const response = await this.client.patch('/notifications/mark-all-read', {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get unread notification count via HTTP
   */
  async getUnreadNotificationCount(): Promise<{
    count: number;
  }> {
    const response = await this.client.get('/notifications/unread-count');
    return response.data;
  }

  async getStudentDashboard(): Promise<StudentDashboard> {
    const response = await this.client.get('/student/dashboard');
    return response.data;
  }

  // Manual Scoring Methods
  async getPendingManualGrading(params = {}) {
    const response = await this.client.get('/manual-scoring/pending-review', { params });
    return response.data;
  }

  async updateQuestionScore(resultId: string, questionIndex: number, data: {
    pointsEarned: number;
    isCorrect: boolean;
    feedback?: string;
  }) {
    const response = await this.client.patch(
      `/manual-scoring/results/${resultId}/questions/${questionIndex}`,
      data
    );
    return response.data;
  }

  async bulkUpdateQuestionScores(resultId: string, data: {
    updates: Array<{
      questionIndex: number;
      pointsEarned: number;
      isCorrect: boolean;
      feedback?: string;
    }>;
    feedback?: string;
  }) {
    const response = await this.client.patch(`/manual-scoring/results/${resultId}/bulk-update`, data);
    return response.data;
  }

  async overrideTotalScore(resultId: string, data: {
    totalScore: number;
    percentage: number;
    passed: boolean;
    reason: string;
  }) {
    const response = await this.client.patch(`/manual-scoring/results/${resultId}/override-score`, data);
    return response.data;
  }

  // =====================================================
  // CODE CHALLENGE API METHODS
  // =====================================================

  /**
   * Get all code challenges with filtering
   */
  async getCodeChallenges(params: {
    language?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
    page?: number;
    limit?: number;
    solved?: boolean;
    sortBy?: 'createdAt' | 'difficulty' | 'popular' | 'success-rate';
  } = {}): Promise<{
    success: boolean;
    challenges: Array<{
      _id: string;
      title: string;
      slug: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      supportedLanguages: string[];
      topics: string[];
      tags: string[];
      usageStats: {
        totalAttempts: number;
        successfulSolutions: number;
        successRate: number;
      };
      userProgress?: {
        status: string;
        totalAttempts: number;
        solved: boolean;
      };
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.client.get('/code-challenges/challenges', { params });
    return response.data;
  }

  /**
   * Get specific code challenge by ID
   */
  async getCodeChallenge(challengeId: string): Promise<{
    success: boolean;
    challenge: {
      _id: string;
      title: string;
      slug: string;
      description: string;
      problemStatement: string;
      difficulty: 'easy' | 'medium' | 'hard';
      supportedLanguages: string[];
      topics: string[];
      tags: string[];
      examples: Array<{
        input: string;
        output: string;
        explanation: string;
      }>;
      constraints: string[];
      testCases: Array<{
        name: string;
        args: any[];
        expected: any;
        hidden: boolean;
      }>;
      codeConfig: {
        [language: string]: {
          runtime: string;
          entryFunction: string;
          timeoutMs: number;
        };
      };
      startingCode: {
        [language: string]: string;
      };
      timeComplexity?: string;
      spaceComplexity?: string;
      hints: string[];
    };
    userProgress?: {
      status: string;
      totalAttempts: number;
      solved: boolean;
    };
    recentSubmissions: Array<{
      language: string;
      status: string;
      submittedAt: string;
      passedTests: number;
      totalTests: number;
    }>;
  }> {
    const response = await this.client.get(`/code-challenges/challenges/${challengeId}`);
    return response.data;
  }

  /**
   * Test code against sample test cases (no submission created)
   */
  async testChallengeCode(challengeId: string, data: {
    code: string;
    language: string;
  }): Promise<{
    success: boolean;
    results: {
      success: boolean;
      testResults: Array<{
        testName: string;
        testCaseIndex: number;
        passed: boolean;
        actualOutput: string;
        expectedOutput: string;
        executionTime: number;
        consoleLogs: any[];
        error: string | null;
      }>;
      overallPassed: boolean;
      totalTestsPassed: number;
      totalTests: number;
      consoleLogs: any[];
      executionError: string | null;
      compilationError: string | null;
      message: string;
      testType: 'sample_tests';
      totalSampleTests: number;
      passedSampleTests: number;
    };
  }> {
    const response = await this.client.post(`/code-challenges/challenges/${challengeId}/test`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Submit code for final evaluation (creates submission record)
   */
  async submitChallengeCode(challengeId: string, data: {
    code: string;
    language: string;
    trackId?: string;
    hasTestedCode: boolean;
  }): Promise<{
    success: boolean;
    submissionId: string;
    results: {
      success: boolean;
      testResults: Array<{
        testName: string;
        testCaseIndex: number;
        passed: boolean;
        actualOutput: string;
        expectedOutput: string;
        executionTime: number;
        consoleLogs: any[];
        error: string | null;
      }>;
      overallPassed: boolean;
      totalTestsPassed: number;
      totalTests: number;
      consoleLogs: any[];
      executionError: string | null;
      compilationError: string | null;
    };
    userProgress: {
      status: string;
      totalAttempts: number;
      solved: boolean;
    };
    crossTrackInsights?: any[];
  }> {
    const response = await this.client.post(`/code-challenges/challenges/${challengeId}/submit`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get user's code challenge dashboard
   */
  async getCodeChallengeDashboard(): Promise<{
    success: boolean;
    dashboard: {
      challengeStats: {
        totalAttempted: number;
        totalSolved: number;
        javascriptSolved: number;
        pythonSolved: number;
        dartSolved: number;
      };
      trackStats: {
        totalEnrolled: number;
        totalCompleted: number;
        totalInProgress: number;
      };
      recentSubmissions: Array<{
        challengeId: string;
        language: string;
        status: string;
        submittedAt: string;
        passedTests: number;
        totalTests: number;
      }>;
      recentActivity: any[];
      streaks: any;
    };
  }> {
    const response = await this.client.get('/code-challenges/dashboard');
    return response.data;
  }

  /**
   * Get all tracks
   */
  async getCodeChallengeTracks(params: {
    language?: string;
    category?: string;
    difficulty?: string;
    featured?: boolean;
  } = {}): Promise<{
    success: boolean;
    tracks: Array<{
      _id: string;
      title: string;
      slug: string;
      description: string;
      language: string;
      difficulty: string;
      challenges: number; // Just the count in listing
    }>;
  }> {
    const response = await this.client.get('/code-challenges/tracks', { params });
    return response.data;
  }

  /**
   * Get specific track with challenges
   */
  async getCodeChallengeTrack(language: string, trackSlug: string): Promise<{
    success: boolean;
    track: {
      _id: string;
      title: string;
      slug: string;
      description: string;
      language: string;
      difficulty: string;
      challenges: Array<{
        challengeId: string;
        order: number;
        isOptional: boolean;
        unlockAfter?: string;
        challenge: {
          _id: string;
          title: string;
          difficulty: string;
        };
        userProgress?: any;
        isUnlocked: boolean;
      }>;
      userProgress?: {
        status: string;
        completedChallenges: number;
        totalChallenges: number;
      };
    };
  }> {
    const response = await this.client.get(`/code-challenges/tracks/${language}/${trackSlug}`);
    return response.data;
  }

  /**
   * Enroll in a track
   */
  async enrollInTrack(language: string, trackSlug: string): Promise<{
    success: boolean;
    message: string;
    userProgress: any;
  }> {
    const response = await this.client.post(`/code-challenges/tracks/${language}/${trackSlug}/enroll`, {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get user's track progress
   */
  async getTrackProgress(language: string, trackSlug: string): Promise<{
    success: boolean;
    track: any;
    userProgress: any;
  }> {
    const response = await this.client.get(`/code-challenges/tracks/${language}/${trackSlug}/progress`);
    return response.data;
  }

  // =====================================================
  // ADMIN CODE CHALLENGE METHODS - Add these to ApiService
  // =====================================================

  /**
   * Create new challenge (admin only)
   */
  async createCodeChallenge(data: {
    title: string;
    description: string;
    problemStatement: string;
    difficulty: 'easy' | 'medium' | 'hard';
    supportedLanguages: string[];
    topics: string[];
    tags: string[];
    examples: Array<{
      input: string;
      output: string;
      explanation: string;
    }>;
    constraints: string[];
    hints: string[];
    codeConfig: {
      [language: string]: {
        runtime: string;
        entryFunction: string;
        timeoutMs: number;
      };
    };
    startingCode: {
      [language: string]: string;
    };
    testCases: Array<{
      name: string;
      args: any[];
      expected: any;
      hidden: boolean;
    }>;
    solutionCode?: {
      [language: string]: string;
    };
    editorial?: string;
    timeComplexity?: string;
    spaceComplexity?: string;
    companyTags?: string[];
    isPremium?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    challenge: any;
  }> {
    const response = await this.client.post('/code-challenges/admin/challenges', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Bulk import code challenges (admin only)
   */
  async bulkImportCodeChallenges(data: {
    challenges: Array<{
      title: string;
      description?: string;
      problemStatement: string;
      difficulty: 'easy' | 'medium' | 'hard';
      supportedLanguages: string[];
      topics?: string[];
      tags?: string[];
      examples?: Array<{ input: any; output: any; explanation?: string }>;
      constraints?: string[];
      hints?: string[];
      codeConfig?: Record<string, { runtime: string; entryFunction: string; timeoutMs?: number; memoryLimitMb?: number }>;
      startingCode?: Record<string, string>;
      testCases: Array<{ name?: string; args: any[]; expected: any; hidden?: boolean }>;
      solutionCode?: Record<string, string>;
      editorial?: string;
      timeComplexity?: string;
      spaceComplexity?: string;
      companyTags?: string[];
      status?: 'draft' | 'active' | 'archived';
    }>;
    skipDuplicates?: boolean;
    defaultStatus?: 'draft' | 'active' | 'archived';
    addToTrackId?: string;
    startingOrder?: number;
  }): Promise<{
    success: boolean;
    message: string;
    imported: number;
    skipped: number;
    failed: number;
    errors?: string[];
    challenges?: any[];
  }> {
    const response = await this.client.post('/code-challenges/admin/challenges/bulk', data, {
      headers: this.getCsrfHeaders(),
      timeout: 60000, // 60 second timeout for bulk operations
    });
    return response.data;
  }

  /**
   * Get all challenges (admin only)
   */
  async getAllCodeChallengesAdmin(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    language?: string;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    challenges: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.client.get('/code-challenges/admin/challenges', { params });
    return response.data;
  }

  /**
   * Update challenge (admin only)
   */
  async updateCodeChallenge(challengeNumber: string, data: any): Promise<{
    success: boolean;
    message: string;
    challenge: any;
  }> {
    const response = await this.client.put(`/code-challenges/admin/challenges/${challengeNumber}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Delete/archive challenge (admin only)
   */
  async deleteCodeChallenge(challengeNumber: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.delete(`/code-challenges/admin/challenges/${challengeNumber}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Test challenge with solution code (admin only)
   */
  async testChallengeAdmin(challengeNumber: string, data: {
    language: string;
    code?: string;
  }): Promise<{
    success: boolean;
    testResults: any;
  }> {
    const response = await this.client.post(`/code-challenges/admin/challenges/${challengeNumber}/test`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Validate challenge solution code against test cases (before saving)
   * This allows testing code without creating the challenge first
   */
  async validateChallengeCode(data: {
    language: string;
    solutionCode: string;
    testCases: Array<{
      name: string;
      args: any[];
      expected: any;
      hidden?: boolean;
    }>;
    codeConfig?: {
      runtime: string;
      entryFunction: string;
      timeoutMs?: number;
    };
  }): Promise<{
    success: boolean;
    results: {
      passed: boolean;
      totalTests: number;
      passedTests: number;
      failedTests: number;
      testResults: Array<{
        name: string;
        passed: boolean;
        expected: any;
        actual: any;
        error?: string;
        runtime?: number;
      }>;
    };
  }> {
    const response = await this.client.post('/code-challenges/admin/validate-code', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Create new track (admin only)
   */
  async createCodeTrack(data: {
    title: string;
    description: string;
    language: string;
    category: string;
    difficulty: string;
    estimatedHours: number;
    prerequisites?: string[];
    learningObjectives?: string[];
    challenges?: Array<{
      challengeId: string;
      order: number;
      isOptional?: boolean;
      unlockAfter?: number;
    }>;
    iconUrl?: string;
    bannerUrl?: string;
    isFeatured?: boolean;
    isPremium?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    track: any;
  }> {
    const response = await this.client.post('/code-challenges/admin/tracks', data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get all tracks (admin only)
   */
  async getAllCodeTracksAdmin(params: {
    page?: number;
    limit?: number;
    language?: string;
    category?: string;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    tracks: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.client.get('/code-challenges/admin/tracks', { params });
    return response.data;
  }

  /**
   * Update track (admin only)
   */
  async updateCodeTrack(language: string, trackSlug: string, data: any): Promise<{
    success: boolean;
    message: string;
    track: any;
  }> {
    const response = await this.client.put(`/code-challenges/admin/tracks/${language}/${trackSlug}`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Delete track (admin only)
   */
  async deleteCodeTrack(language: string, trackSlug: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await this.client.delete(`/code-challenges/admin/tracks/${language}/${trackSlug}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Add challenge to track (admin only)
   */
  async addChallengeToTrack(language: string, trackSlug: string, data: {
    challengeId: string;
    order: number;
    isOptional?: boolean;
    unlockAfter?: number;
    skipValidation?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    validation?: {
      valid: boolean;
      errors: string[];
      details: {
        passed: number;
        total: number;
      };
    };
  }> {
    const response = await this.client.post(`/code-challenges/admin/tracks/${language}/${trackSlug}/challenges`, data, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Remove challenge from track (admin only)
   */
  async removeChallengeFromTrack(language: string, trackSlug: string, challengeId: string): Promise<{
    success: boolean;
    message: string;
    languageSlotReleased?: string;
  }> {
    const response = await this.client.delete(`/code-challenges/admin/tracks/${language}/${trackSlug}/challenges/${challengeId}`, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get challenges available for a specific language track (admin only)
   * Returns challenges that have unclaimed language slots for the specified language
   */
  async getAvailableChallengesForLanguage(language: string, params: {
    difficulty?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    language: string;
    challenges: Array<{
      _id: string;
      slug: string;
      title: string;
      description: string;
      difficulty: string;
      supportedLanguages: string[];
      topics: string[];
      tags: string[];
      trackAssignments: Record<string, string | null>;
      availableLanguageSlots: string[];
      allSlotsClaimed: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.client.get(`/code-challenges/admin/challenges/available/${language}`, {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get challenge track assignments (admin only)
   * Shows which tracks have claimed which language slots for challenges
   */
  async getChallengeTrackAssignments(params: {
    language?: string;
    onlyAvailable?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    challenges: Array<{
      _id: string;
      slug: string;
      title: string;
      supportedLanguages: string[];
      trackAssignments: Record<string, {
        _id: string;
        slug: string;
        title: string;
        language: string;
      } | null>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await this.client.get('/code-challenges/admin/challenges/track-assignments', {
      params,
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

  /**
   * Get admin analytics (admin only)
   */
  async getCodeChallengeAnalytics(params: {
    period?: '7d' | '30d' | '90d';
  } = {}): Promise<{
    success: boolean;
    analytics: {
      period: string;
      challengeStats: any;
      trackStats: any;
      submissionStats: any;
      userActivityStats: any;
      popularChallenges: any[];
      difficultChallenges: any[];
    };
  }> {
    const response = await this.client.get('/code-challenges/admin/analytics', { params });
    return response.data;
  }

  /**
   * Get tracks overview for admin dashboard
   */
  async getTracksOverview(params: {
    language?: string;
  } = {}): Promise<{
    success: boolean;
    tracks: any[];
  }> {
    const response = await this.client.get('/code-challenges/admin/dashboard/tracks', { params });
    return response.data;
  }

  /**
   * Get challenges overview for admin dashboard
   */
  async getChallengesOverview(params: {
    difficulty?: string;
    language?: string;
    status?: string;
  } = {}): Promise<{
    success: boolean;
    challenges: any[];
  }> {
    const response = await this.client.get('/code-challenges/admin/dashboard/challenges', { params });
    return response.data;
  }

  /**
   * Get single track with detailed stats (admin view)
   */
  async getTrackById(language: string, trackSlug: string): Promise<{
    success: boolean;
    track: any;
  }> {
    const response = await this.client.get(`/code-challenges/admin/tracks/${language}/${trackSlug}`);
    return response.data;
  }

  /**
   * Get single challenge with detailed stats (admin view)
   */
  async getChallengeById(challengeNumber: string): Promise<{
    success: boolean;
    challenge: any;
  }> {
    const response = await this.client.get(`/code-challenges/admin/challenges/${challengeNumber}`);
    return response.data;
  }

  // =====================================================
  // QUEUE MANAGEMENT (Admin Only)
  // =====================================================

  /**
   * Get queue status (lightweight, for polling)
   */
  async getQueueStatus(): Promise<{
    queueDepth: number;
    running: number;
    avgWaitMs: number;
    healthy: boolean;
  }> {
    const response = await this.client.get('/grading/queue/status');
    return response.data;
  }

  /**
   * Get detailed queue metrics
   */
  async getQueueMetrics(): Promise<{
    currentQueueDepth: number;
    currentRunning: number;
    runningByLanguage: Record<string, number>;
    totalJobsProcessed: number;
    totalJobsQueued: number;
    totalJobsImmediate: number;
    averageWaitTimeMs: number;
    maxWaitTimeMs: number;
    highPriorityProcessed: number;
    normalPriorityProcessed: number;
    totalTimeouts: number;
    totalErrors: number;
    lastJobProcessedAt: string | null;
    serviceStartedAt: string;
    security: {
      totalScans: number;
      totalRejections: number;
      rejectionRate: string;
      recentViolations: Array<{
        timestamp: string;
        language: string;
        violations: string[];
      }>;
    };
  }> {
    const response = await this.client.get('/grading/queue/metrics');
    return response.data;
  }

  /**
   * Reset queue metrics (admin only)
   */
  async resetQueueMetrics(): Promise<{ message: string }> {
    const response = await this.client.post('/grading/queue/reset-metrics', {}, {
      headers: this.getCsrfHeaders(),
    });
    return response.data;
  }

}

export default new ApiService();