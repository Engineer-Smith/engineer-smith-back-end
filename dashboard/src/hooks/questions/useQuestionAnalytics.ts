// hooks/useQuestionAnalytics.ts - New hook for individual question analytics
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';

interface QuestionAnalytics {
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
}

interface UseQuestionAnalyticsReturn {
  analytics: QuestionAnalytics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useQuestionAnalytics = (questionId: string): UseQuestionAnalyticsReturn => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<QuestionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!questionId || !user) return;

    try {
      setLoading(true);
      setError(null);


      // Call the question analytics endpoint with questionId filter
      const analyticsArray = await apiService.getQuestionAnalytics({
        questionId: questionId,
        // Could add additional filters if needed:
        // orgId: user.organizationId,
        // limit: 1
      });


      // The API returns an array, but we're filtering by questionId so should get 1 result
      if (analyticsArray && analyticsArray.length > 0) {
        setAnalytics(analyticsArray[0]);
      } else {
        // No analytics data yet (question hasn't been used in tests)
        setAnalytics(null);
      }

    } catch (fetchError: any) {
      console.error('useQuestionAnalytics: Error fetching analytics:', fetchError);
      setError(fetchError.message || 'Failed to fetch question analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId && user) {
      fetchAnalytics();
    }
  }, [questionId, user]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics
  };
};