// hooks/useQuestionStats.ts - FIXED: Remove wrapper response handling
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';
import { skills, getSkillCount } from '../../config/skills';

interface QuestionStatsData {
  byLanguage: Array<{
    language: string;
    count: number;
    difficultyBreakdown: {
      easy: number;
      medium: number;
      hard: number;
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
  };
}

// Type for individual language stat to make callbacks type-safe
type LanguageStat = QuestionStatsData['byLanguage'][0];

interface UseQuestionStatsReturn {
  stats: { [key: string]: number };
  subCategoryBreakdowns: { [key: string]: { [key: string]: number } };
  totalStats: QuestionStatsData['totals'] | null;
  rawLanguageStats: QuestionStatsData['byLanguage'];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  maxCount: number; // For progress bars
}

export const useQuestionStats = (): UseQuestionStatsReturn => {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ [key: string]: number }>({});
  const [subCategoryBreakdowns, setSubCategoryBreakdowns] = useState<{ [key: string]: { [key: string]: number } }>({});
  const [totalStats, setTotalStats] = useState<QuestionStatsData['totals'] | null>(null);
  const [rawLanguageStats, setRawLanguageStats] = useState<QuestionStatsData['byLanguage']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxCount, setMaxCount] = useState(0);

  const fetchQuestionStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // FIXED: API service returns data directly, no wrapper
      const statsData = await apiService.getQuestionStats();


      // FIXED: Use statsData directly, not statsData.data
      const { byLanguage, totals } = statsData;
      
      // Validate the response structure
      if (!byLanguage || !Array.isArray(byLanguage)) {
        throw new Error('Invalid response: byLanguage is not an array');
      }
      
      if (!totals || typeof totals !== 'object') {
        throw new Error('Invalid response: totals is missing or invalid');
      }

      setRawLanguageStats(byLanguage);
      
      // Calculate skill counts using the helper function
      const skillCounts: { [key: string]: number } = {};
      const subBreakdowns: { [key: string]: { [key: string]: number } } = {};
      let maxSkillCount = 0;

      skills.forEach(skill => {
        const count = getSkillCount(skill, byLanguage);
        skillCounts[skill.skill] = count;
        maxSkillCount = Math.max(maxSkillCount, count);

        // If skill has sub-categories, build breakdown
        if (skill.subCategories) {
          subBreakdowns[skill.skill] = {};
          skill.subCategories.forEach(subCat => {
            // FIXED: Explicitly type the callback parameter
            const subStat = byLanguage.find((s: LanguageStat) => s.language === subCat);
            subBreakdowns[skill.skill][subCat] = subStat?.count || 0;
          });
        }
      });
      
      setStats(skillCounts);
      setSubCategoryBreakdowns(subBreakdowns);
      setTotalStats(totals);
      setMaxCount(maxSkillCount);
    } catch (error: any) {
      console.error('useQuestionStats: Error fetching question stats:', error);
      setError(error.message || 'Failed to fetch question statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchQuestionStats();
    }
  }, [user]);

  return {
    stats,
    subCategoryBreakdowns,
    totalStats,
    rawLanguageStats,
    loading,
    error,
    refetch: fetchQuestionStats,
    maxCount
  };
};