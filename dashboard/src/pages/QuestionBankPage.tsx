// pages/QuestionBankPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Components
import QuestionBankHeader from '../components/QuestionBank/QuestionBankHeader';
import StatsCards from '../components/QuestionBank/StatsCard';
import SkillCard from '../components/QuestionBank/SkillCard';
import AddQuestionCard from '../components/QuestionBank/AddQuestionCard';
import QuickActions from '../components/QuestionBank/QuickActions';

// Hooks and config
import { useQuestionStats } from '../hooks/questions/useQuestionStats';
import { skills } from '../config/skills';

const QuestionBankPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stats,
    subCategoryBreakdowns,
    totalStats,
    loading,
    error,
    refetch,
    maxCount
  } = useQuestionStats();

  // Success message state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message after 5 seconds
      const timer = setTimeout(() => setSuccessMessage(null), 5000);

      // Clear the location state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Navigation handlers
  const handleCreateQuestion = () => navigate('/admin/question-bank/add');
  const handleImportQuestions = () => navigate('/admin/question-bank/import');
  const handleViewAnalytics = () => navigate('/admin/analytics');
  const handleSkillClick = (skillName: string) => navigate(`/admin/question-bank/${skillName}`);

  // Loading state
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading question bank...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="card p-6 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Questions</h3>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button className="btn-primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <QuestionBankHeader user={user} />

      <div className="container-section py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-green-400 hover:text-green-300"
            >
              &times;
            </button>
          </div>
        )}

        <StatsCards
          totalStats={totalStats}
          skillCategoriesCount={skills.length}
          loading={loading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AddQuestionCard onClick={handleCreateQuestion} />

          {skills.map((skill) => (
            <SkillCard
              key={skill.skill}
              skill={skill}
              count={stats[skill.skill] || 0}
              loading={loading}
              onClick={() => handleSkillClick(skill.skill)}
              subCategoryBreakdown={subCategoryBreakdowns[skill.skill]}
              maxCount={maxCount}
            />
          ))}
        </div>

        <QuickActions
          onCreateQuestion={handleCreateQuestion}
          onImportQuestions={handleImportQuestions}
          onViewAnalytics={handleViewAnalytics}
        />
      </div>
    </div>
  );
};

export default QuestionBankPage;
