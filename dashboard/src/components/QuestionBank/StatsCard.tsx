// components/QuestionBank/StatsCards.tsx
import { BookOpen, Code, Layers } from 'lucide-react';

interface QuestionStats {
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
}

interface StatsCardsProps {
  totalStats: QuestionStats | null;
  skillCategoriesCount: number;
  loading: boolean;
}

const StatsCards = ({ totalStats, skillCategoriesCount, loading }: StatsCardsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div className="card p-5 bg-green-500/5 border-green-500/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <p className="font-mono text-3xl font-bold text-green-400">
            {loading ? '...' : (totalStats?.totalQuestions || 0)}
          </p>
          <p className="text-[#6b6b70] text-sm">Total Questions</p>
        </div>
      </div>
    </div>

    <div className="card p-5 bg-blue-500/5 border-blue-500/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Code className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p className="font-mono text-3xl font-bold text-blue-400">
            {skillCategoriesCount}
          </p>
          <p className="text-[#6b6b70] text-sm">Skill Categories</p>
        </div>
      </div>
    </div>

    <div className="card p-5 bg-purple-500/5 border-purple-500/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Layers className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <p className="font-mono text-xl font-bold text-purple-400">
            {loading ? 'Loading...' :
             totalStats?.difficultyBreakdown ?
               `${totalStats.difficultyBreakdown.easy}/${totalStats.difficultyBreakdown.medium}/${totalStats.difficultyBreakdown.hard}`
               : 'Ready'
            }
          </p>
          <p className="text-[#6b6b70] text-sm">
            {totalStats?.difficultyBreakdown ? 'Easy/Medium/Hard' : 'Add New Questions'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default StatsCards;
