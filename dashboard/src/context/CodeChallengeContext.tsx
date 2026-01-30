// =====================================================
// CodeChallengeContext.tsx - Centralized state management for code challenges
// =====================================================

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import ApiService from '../services/ApiService';

// Import all types from the centralized types file
import type {
    AdminChallenge,
    AdminTrack,
    AdminTrackDetail,
    AdminChallengeDetail,
    AdminTrackOverview,
    AdminChallengeOverview,
    AdminDashboardAnalytics,
    PublicChallenge,
    PublicTrack,
    UserChallengeProgress,
    CreateTrackFormData,
    CreateChallengeFormData,
    AssignChallengeRequest,
    ChallengeFilters,
    TrackFilters,
    CodeChallengeLoadingStates,
    CodeChallengeErrors,
} from '../types/codeChallenge';

// Local interfaces for context-specific needs
interface Dashboard {
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
}

interface TestResults {
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
    testType?: 'sample_tests';
    totalSampleTests?: number;
    passedSampleTests?: number;
}

interface SubmissionResult {
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
}

// State interface
interface CodeChallengeState {
    // Dashboard and user data
    dashboard: Dashboard | null;
    challenges: PublicChallenge[];
    tracks: PublicTrack[];
    currentChallenge: PublicChallenge | null;
    currentTrack: PublicTrack | null;
    userProgress: Record<string, UserChallengeProgress>;

    // Admin data
    adminChallenges: AdminChallenge[];
    adminTracks: AdminTrack[];
    tracksOverview: AdminTrackOverview[];
    challengesOverview: AdminChallengeOverview[];
    trackDetail: AdminTrackDetail | null;
    challengeDetail: AdminChallengeDetail | null;
    analytics: AdminDashboardAnalytics | null;

    // UI state
    loading: CodeChallengeLoadingStates;
    errors: CodeChallengeErrors;
    filters: ChallengeFilters & TrackFilters;

    // Test and submission results
    testResults: TestResults | null;
    submissionResult: SubmissionResult | null;
}

// Context type
interface CodeChallengeContextType extends CodeChallengeState {
    // Actions
    loadDashboard: () => Promise<void>;
    loadChallenges: (filters?: ChallengeFilters) => Promise<void>;
    loadChallenge: (challengeId: string) => Promise<void>;
    loadTracks: (language?: string) => Promise<void>;
    loadTrack: (language: string, trackSlug: string) => Promise<void>;
    enrollInTrack: (language: string, trackSlug: string) => Promise<any>;
    testCode: (challengeId: string, language: string, code: string) => Promise<TestResults>;
    submitCode: (challengeId: string, language: string, code: string) => Promise<SubmissionResult>;
    updateFilters: (newFilters: Partial<CodeChallengeState['filters']>) => void;
    resetFilters: () => void;
    clearError: (key: string) => void;

    // Admin Actions
    createCodeChallenge: (data: CreateChallengeFormData) => Promise<any>;
    loadAllChallengesAdmin: (filters?: ChallengeFilters) => Promise<void>;
    updateCodeChallenge: (challengeNumber: string, data: any) => Promise<any>;
    deleteCodeChallenge: (challengeNumber: string) => Promise<any>;
    testChallengeAdmin: (challengeNumber: string, data: { language: string; code?: string }) => Promise<any>;
    createCodeTrack: (data: CreateTrackFormData) => Promise<any>;
    loadAllTracksAdmin: (filters?: TrackFilters) => Promise<void>;
    updateCodeTrack: (language: string, trackSlug: string, data: any) => Promise<any>;
    deleteCodeTrack: (language: string, trackSlug: string) => Promise<any>;
    addChallengeToTrack: (language: string, trackSlug: string, data: AssignChallengeRequest) => Promise<any>;
    removeChallengeFromTrack: (language: string, trackSlug: string, challengeId: string) => Promise<any>;
    loadAnalytics: (period?: '7d' | '30d' | '90d') => Promise<void>;

    // New Admin Dashboard Methods
    loadTracksOverview: (filters?: Record<string, any>) => Promise<{ success: boolean; tracks: AdminTrackOverview[]; }>;
    loadChallengesOverview: (filters?: Record<string, any>) => Promise<{ success: boolean; challenges: AdminChallengeOverview[]; }>;
    loadTrackById: (language: string, trackSlug: string) => Promise<{ success: boolean; track: AdminTrackDetail; }>;
    loadChallengeById: (challengeNumber: string) => Promise<{ success: boolean; challenge: AdminChallengeDetail; }>;

    // Utilities
    getLanguageStats: (language: string) => number | null;
    getTrackProgress: (language: string, trackSlug: string) => UserChallengeProgress | null;
    getChallengeProgress: (challengeId: string) => UserChallengeProgress | null;
}

// Action types
const actionTypes = {
    SET_DASHBOARD: 'SET_DASHBOARD',
    SET_CHALLENGES: 'SET_CHALLENGES',
    SET_TRACKS: 'SET_TRACKS',
    SET_CURRENT_CHALLENGE: 'SET_CURRENT_CHALLENGE',
    SET_CURRENT_TRACK: 'SET_CURRENT_TRACK',
    SET_USER_PROGRESS: 'SET_USER_PROGRESS',
    SET_ADMIN_CHALLENGES: 'SET_ADMIN_CHALLENGES',
    SET_ADMIN_TRACKS: 'SET_ADMIN_TRACKS',
    SET_TRACKS_OVERVIEW: 'SET_TRACKS_OVERVIEW',
    SET_CHALLENGES_OVERVIEW: 'SET_CHALLENGES_OVERVIEW',
    SET_TRACK_DETAIL: 'SET_TRACK_DETAIL',
    SET_CHALLENGE_DETAIL: 'SET_CHALLENGE_DETAIL',
    SET_ANALYTICS: 'SET_ANALYTICS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
    SET_FILTERS: 'SET_FILTERS',
    RESET_FILTERS: 'RESET_FILTERS',
    SET_TEST_RESULTS: 'SET_TEST_RESULTS',
    SET_SUBMISSION_RESULT: 'SET_SUBMISSION_RESULT',
};

// Initial state
const initialState: CodeChallengeState = {
    dashboard: null,
    challenges: [],
    tracks: [],
    currentChallenge: null,
    currentTrack: null,
    userProgress: {},
    adminChallenges: [],
    adminTracks: [],
    tracksOverview: [],
    challengesOverview: [],
    trackDetail: null,
    challengeDetail: null,
    analytics: null,
    loading: {
        dashboard: false,
        challenges: false,
        tracks: false,
        track: false,
        challenge: false,
        submission: false,
        adminChallenges: false,
        adminTracks: false,
        analytics: false,
        creating: false,
        updating: false,
        deleting: false,
        testing: false,
        submitting: false,
    },
    errors: {},
    filters: {},
    testResults: null,
    submissionResult: null,
};

// Reducer
const codeChallengeReducer = (state: CodeChallengeState, action: any): CodeChallengeState => {
    switch (action.type) {
        case actionTypes.SET_DASHBOARD:
            return { ...state, dashboard: action.payload };
        case actionTypes.SET_CHALLENGES:
            return { ...state, challenges: action.payload };
        case actionTypes.SET_TRACKS:
            return { ...state, tracks: action.payload };
        case actionTypes.SET_CURRENT_CHALLENGE:
            return { ...state, currentChallenge: action.payload };
        case actionTypes.SET_CURRENT_TRACK:
            return { ...state, currentTrack: action.payload };
        case actionTypes.SET_USER_PROGRESS:
            return { ...state, userProgress: { ...state.userProgress, ...action.payload } };
        case actionTypes.SET_ADMIN_CHALLENGES:
            return { ...state, adminChallenges: action.payload };
        case actionTypes.SET_ADMIN_TRACKS:
            return { ...state, adminTracks: action.payload };
        case actionTypes.SET_TRACKS_OVERVIEW:
            return { ...state, tracksOverview: action.payload };
        case actionTypes.SET_CHALLENGES_OVERVIEW:
            return { ...state, challengesOverview: action.payload };
        case actionTypes.SET_TRACK_DETAIL:
            return { ...state, trackDetail: action.payload };
        case actionTypes.SET_CHALLENGE_DETAIL:
            return { ...state, challengeDetail: action.payload };
        case actionTypes.SET_ANALYTICS:
            return { ...state, analytics: action.payload };
        case actionTypes.SET_LOADING:
            return {
                ...state,
                loading: { ...state.loading, [action.payload.key]: action.payload.value }
            };
        case actionTypes.SET_ERROR:
            return {
                ...state,
                errors: { ...state.errors, [action.payload.key]: action.payload.error }
            };
        case actionTypes.CLEAR_ERROR:
            const { [action.payload as string]: removed, ...remainingErrors } = state.errors;
            return { ...state, errors: remainingErrors };
        case actionTypes.SET_FILTERS:
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case actionTypes.RESET_FILTERS:
            return { ...state, filters: {} };
        case actionTypes.SET_TEST_RESULTS:
            return { ...state, testResults: action.payload };
        case actionTypes.SET_SUBMISSION_RESULT:
            return { ...state, submissionResult: action.payload };
        default:
            return state;
    }
};

// Context
const CodeChallengeContext = createContext<CodeChallengeContextType | null>(null);

// Provider component
export const CodeChallengeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(codeChallengeReducer, initialState);

    // Helper functions
    const setLoading = useCallback((key: keyof CodeChallengeLoadingStates, value: boolean) => {
        dispatch({
            type: actionTypes.SET_LOADING,
            payload: { key, value }
        });
    }, []);

    const setError = useCallback((key: string, error: any) => {
        const errorMessage = error?.response?.data?.message || error?.message || 'An unknown error occurred';
        dispatch({
            type: actionTypes.SET_ERROR,
            payload: { key, error: errorMessage }
        });
    }, []);

    // Dashboard actions
    const loadDashboard = useCallback(async () => {
        try {
            setLoading('dashboard', true);
            const response = await ApiService.getCodeChallengeDashboard();

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_DASHBOARD,
                    payload: response.dashboard
                });
            }
        } catch (error) {
            setError('dashboard', error);
        } finally {
            setLoading('dashboard', false);
        }
    }, [setLoading, setError]);

    // Challenge actions
    const loadChallenges = useCallback(async (filters: ChallengeFilters = {}) => {
        try {
            setLoading('challenges', true);
            const response = await ApiService.getCodeChallenges(filters);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_CHALLENGES,
                    payload: response.challenges
                });
            }
        } catch (error) {
            setError('challenges', error);
        } finally {
            setLoading('challenges', false);
        }
    }, [setLoading, setError]);

    const loadChallenge = useCallback(async (challengeId: string) => {
        try {
            setLoading('challenge', true);
            const response = await ApiService.getCodeChallenge(challengeId);

            if (response.success) {
                // Merge userProgress into challenge so it's accessible as currentChallenge.userProgress
                const challengeWithProgress = {
                    ...response.challenge,
                    userProgress: response.userProgress,
                    recentSubmissions: response.recentSubmissions
                };
                dispatch({
                    type: actionTypes.SET_CURRENT_CHALLENGE,
                    payload: challengeWithProgress
                });
            }
        } catch (error) {
            setError('challenge', error);
        } finally {
            setLoading('challenge', false);
        }
    }, [setLoading, setError]);

    // Track actions
    const loadTracks = useCallback(async (language?: string) => {
        try {
            setLoading('tracks', true);
            // Fix: Pass params object instead of just string
            const response = await ApiService.getCodeChallengeTracks(language ? { language } : {});

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_TRACKS,
                    payload: response.tracks
                });
            }
        } catch (error) {
            setError('tracks', error);
        } finally {
            setLoading('tracks', false);
        }
    }, [setLoading, setError]);

    const loadTrack = useCallback(async (language: string, trackSlug: string) => {
        try {
            setLoading('track', true);
            // Fix: Use correct method name
            const response = await ApiService.getCodeChallengeTrack(language, trackSlug);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_CURRENT_TRACK,
                    payload: response.track
                });
            }
        } catch (error) {
            setError('track', error);
        } finally {
            setLoading('track', false);
        }
    }, [setLoading, setError]);

    const enrollInTrack = useCallback(async (language: string, trackSlug: string) => {
        try {
            const response = await ApiService.enrollInTrack(language, trackSlug);

            if (response.success) {
                // Reload the track to get updated enrollment status
                await loadTrack(language, trackSlug);
            }

            return response;
        } catch (error) {
            setError('enrollInTrack', error);
            throw error;
        }
    }, [setError, loadTrack]);

    // Code testing and submission
    const testCode = useCallback(async (challengeId: string, language: string, code: string): Promise<TestResults> => {
        try {
            setLoading('testing', true);
            // Fix: Use correct method name and parameter structure
            const response = await ApiService.testChallengeCode(challengeId, { code, language });

            dispatch({
                type: actionTypes.SET_TEST_RESULTS,
                payload: response.results  // Fix: Use response.results instead of response.testResults
            });

            return response.results;
        } catch (error) {
            setError('testCode', error);
            throw error;
        } finally {
            setLoading('testing', false);
        }
    }, [setLoading, setError]);

    const submitCode = useCallback(async (challengeId: string, language: string, code: string) => {
        try {
            setLoading('submitting', true);
            const response = await ApiService.submitChallengeCode(challengeId, {
                code,
                language,
                hasTestedCode: state.testResults !== null
            });

            dispatch({
                type: actionTypes.SET_SUBMISSION_RESULT,
                payload: response
            });

            // Update user progress in global state
            if (response.userProgress) {
                dispatch({
                    type: actionTypes.SET_USER_PROGRESS,
                    payload: { [`challenge_${challengeId}`]: response.userProgress }
                });

                // Also update currentChallenge.userProgress so the saved code is immediately available
                if (state.currentChallenge && state.currentChallenge._id === challengeId) {
                    dispatch({
                        type: actionTypes.SET_CURRENT_CHALLENGE,
                        payload: {
                            ...state.currentChallenge,
                            userProgress: response.userProgress
                        }
                    });
                }
            }

            return response;
        } catch (error) {
            setError('submitCode', error);
            throw error;
        } finally {
            setLoading('submitting', false);
        }
    }, [setLoading, setError, state.testResults, state.currentChallenge]);

    // Admin actions
    const createCodeChallenge = useCallback(async (data: CreateChallengeFormData) => {
        try {
            setLoading('creating', true);
            const response = await ApiService.createCodeChallenge(data);

            if (response.success) {
                // Reload admin challenges list
                await loadAllChallengesAdmin();
            }

            return response;
        } catch (error) {
            setError('createChallenge', error);
            throw error;
        } finally {
            setLoading('creating', false);
        }
    }, [setLoading, setError]);

    const loadAllChallengesAdmin = useCallback(async (filters: ChallengeFilters = {}) => {
        try {
            setLoading('adminChallenges', true);
            const response = await ApiService.getAllCodeChallengesAdmin(filters);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_ADMIN_CHALLENGES,
                    payload: response.challenges
                });
            }
        } catch (error) {
            setError('adminChallenges', error);
        } finally {
            setLoading('adminChallenges', false);
        }
    }, [setLoading, setError]);

    const updateCodeChallenge = useCallback(async (challengeNumber: string, data: any) => {
        try {
            setLoading('updating', true);
            const response = await ApiService.updateCodeChallenge(challengeNumber, data);

            if (response.success) {
                // Reload admin challenges list
                await loadAllChallengesAdmin();
            }

            return response;
        } catch (error) {
            setError('updateChallenge', error);
            throw error;
        } finally {
            setLoading('updating', false);
        }
    }, [setLoading, setError, loadAllChallengesAdmin]);

    const deleteCodeChallenge = useCallback(async (challengeNumber: string) => {
        try {
            setLoading('deleting', true);
            const response = await ApiService.deleteCodeChallenge(challengeNumber);

            if (response.success) {
                // Reload admin challenges list
                await loadAllChallengesAdmin();
            }

            return response;
        } catch (error) {
            setError('deleteChallenge', error);
            throw error;
        } finally {
            setLoading('deleting', false);
        }
    }, [setLoading, setError, loadAllChallengesAdmin]);

    const testChallengeAdmin = useCallback(async (challengeNumber: string, data: { language: string; code?: string }) => {
        try {
            setLoading('testing', true);
            const response = await ApiService.testChallengeAdmin(challengeNumber, data);

            return response;
        } catch (error) {
            setError('testChallengeAdmin', error);
            throw error;
        } finally {
            setLoading('testing', false);
        }
    }, [setLoading, setError]);

    const createCodeTrack = useCallback(async (data: CreateTrackFormData) => {
        try {
            setLoading('creating', true);
            const response = await ApiService.createCodeTrack(data);

            if (response.success) {
                // Reload admin tracks list
                await loadAllTracksAdmin();
            }

            return response;
        } catch (error) {
            setError('createTrack', error);
            throw error;
        } finally {
            setLoading('creating', false);
        }
    }, [setLoading, setError]);

    const loadAllTracksAdmin = useCallback(async (filters: TrackFilters = {}) => {
        try {
            setLoading('adminTracks', true);
            const response = await ApiService.getAllCodeTracksAdmin(filters);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_ADMIN_TRACKS,
                    payload: response.tracks
                });
            }
        } catch (error) {
            setError('adminTracks', error);
        } finally {
            setLoading('adminTracks', false);
        }
    }, [setLoading, setError]);

    const updateCodeTrack = useCallback(async (language: string, trackSlug: string, data: any) => {
        try {
            setLoading('updating', true);
            const response = await ApiService.updateCodeTrack(language, trackSlug, data);

            if (response.success) {
                // Reload admin tracks list
                await loadAllTracksAdmin();
            }

            return response;
        } catch (error) {
            setError('updateTrack', error);
            throw error;
        } finally {
            setLoading('updating', false);
        }
    }, [setLoading, setError, loadAllTracksAdmin]);

    const deleteCodeTrack = useCallback(async (language: string, trackSlug: string) => {
        try {
            setLoading('deleting', true);
            const response = await ApiService.deleteCodeTrack(language, trackSlug);

            if (response.success) {
                // Reload admin tracks list
                await loadAllTracksAdmin();
            }

            return response;
        } catch (error) {
            setError('deleteTrack', error);
            throw error;
        } finally {
            setLoading('deleting', false);
        }
    }, [setLoading, setError, loadAllTracksAdmin]);

    const addChallengeToTrack = useCallback(async (language: string, trackSlug: string, data: AssignChallengeRequest) => {
        try {
            const response = await ApiService.addChallengeToTrack(language, trackSlug, data);

            if (response.success) {
                // Reload the specific track and admin tracks list
                await Promise.all([
                    loadTrack(language, trackSlug),
                    loadAllTracksAdmin()
                ]);
            }

            return response;
        } catch (error) {
            setError('addChallengeToTrack', error);
            throw error;
        }
    }, [setError, loadTrack, loadAllTracksAdmin]);

    const removeChallengeFromTrack = useCallback(async (language: string, trackSlug: string, challengeId: string) => {
        try {
            const response = await ApiService.removeChallengeFromTrack(language, trackSlug, challengeId);

            if (response.success) {
                // Reload the specific track and admin tracks list
                await Promise.all([
                    loadTrack(language, trackSlug),
                    loadAllTracksAdmin()
                ]);
            }

            return response;
        } catch (error) {
            setError('removeChallengeFromTrack', error);
            throw error;
        }
    }, [setError, loadTrack, loadAllTracksAdmin]);

    const loadAnalytics = useCallback(async (period: '7d' | '30d' | '90d' = '30d') => {
        try {
            setLoading('analytics', true);
            const response = await ApiService.getCodeChallengeAnalytics({ period });

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_ANALYTICS,
                    payload: response.analytics
                });
            }
        } catch (error) {
            setError('analytics', error);
        } finally {
            setLoading('analytics', false);
        }
    }, [setLoading, setError]);

    // New Admin Dashboard Methods
    const loadTracksOverview = useCallback(async (filters: Record<string, any> = {}) => {
        try {
            setLoading('adminTracks', true);
            const response = await ApiService.getTracksOverview(filters);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_TRACKS_OVERVIEW,
                    payload: response.tracks
                });
            }
            return response;
        } catch (error) {
            setError('tracksOverview', error);
            throw error;
        } finally {
            setLoading('adminTracks', false);
        }
    }, [setLoading, setError]);

    const loadChallengesOverview = useCallback(async (filters: Record<string, any> = {}) => {
        try {
            setLoading('adminChallenges', true);
            const response = await ApiService.getChallengesOverview(filters);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_CHALLENGES_OVERVIEW,
                    payload: response.challenges
                });
            }
            return response;
        } catch (error) {
            setError('challengesOverview', error);
            throw error;
        } finally {
            setLoading('adminChallenges', false);
        }
    }, [setLoading, setError]);

    const loadTrackById = useCallback(async (language: string, trackSlug: string) => {
        try {
            setLoading('track', true);
            const response = await ApiService.getTrackById(language, trackSlug);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_TRACK_DETAIL,
                    payload: response.track
                });
            }
            return response;
        } catch (error) {
            setError('trackDetail', error);
            throw error;
        } finally {
            setLoading('track', false);
        }
    }, [setLoading, setError]);

    const loadChallengeById = useCallback(async (challengeNumber: string) => {
        try {
            setLoading('challenge', true);
            const response = await ApiService.getChallengeById(challengeNumber);

            if (response.success) {
                dispatch({
                    type: actionTypes.SET_CHALLENGE_DETAIL,
                    payload: response.challenge
                });
            }
            return response;
        } catch (error) {
            setError('challengeDetail', error);
            throw error;
        } finally {
            setLoading('challenge', false);
        }
    }, [setLoading, setError]);

    // Filter operations
    const updateFilters = useCallback((newFilters: Partial<CodeChallengeState['filters']>) => {
        dispatch({
            type: actionTypes.SET_FILTERS,
            payload: newFilters
        });
    }, []);

    const resetFilters = useCallback(() => {
        dispatch({
            type: actionTypes.RESET_FILTERS
        });
    }, []);

    // Error operations
    const clearError = useCallback((key: string) => {
        dispatch({
            type: actionTypes.CLEAR_ERROR,
            payload: key
        });
    }, []);

    // Utility functions
    const getLanguageStats = useCallback((language: string): number | null => {
        if (!state.dashboard) return null;

        const stats = state.dashboard.challengeStats;
        switch (language) {
            case 'javascript':
                return stats.javascriptSolved || 0;
            case 'python':
                return stats.pythonSolved || 0;
            case 'dart':
                return stats.dartSolved || 0;
            default:
                return 0;
        }
    }, [state.dashboard]);

    const getTrackProgress = useCallback((language: string, trackSlug: string): UserChallengeProgress | null => {
        return state.userProgress[`track_${language}_${trackSlug}`] || null;
    }, [state.userProgress]);

    const getChallengeProgress = useCallback((challengeId: string): UserChallengeProgress | null => {
        return state.userProgress[`challenge_${challengeId}`] || null;
    }, [state.userProgress]);

    // Load initial dashboard on mount
    useEffect(() => {
        loadDashboard();
    }, []);

    // Context value
    const value: CodeChallengeContextType = {
        // State
        ...state,

        // Actions
        loadDashboard,
        loadChallenges,
        loadChallenge,
        loadTracks,
        loadTrack,
        enrollInTrack,
        testCode,
        submitCode,
        updateFilters,
        resetFilters,
        clearError,

        // Admin Actions
        createCodeChallenge,
        loadAllChallengesAdmin,
        updateCodeChallenge,
        deleteCodeChallenge,
        testChallengeAdmin,
        createCodeTrack,
        loadAllTracksAdmin,
        updateCodeTrack,
        deleteCodeTrack,
        addChallengeToTrack,
        removeChallengeFromTrack,
        loadAnalytics,

        // New Admin Dashboard Methods
        loadTracksOverview,
        loadChallengesOverview,
        loadTrackById,
        loadChallengeById,

        // Utilities
        getLanguageStats,
        getTrackProgress,
        getChallengeProgress
    };

    return (
        <CodeChallengeContext.Provider value={value}>
            {children}
        </CodeChallengeContext.Provider>
    );
};

// Custom hook to use the context
export const useCodeChallenge = (): CodeChallengeContextType => {
    const context = useContext(CodeChallengeContext);

    if (!context) {
        throw new Error('useCodeChallenge must be used within a CodeChallengeProvider');
    }

    return context;
};

export default CodeChallengeContext;