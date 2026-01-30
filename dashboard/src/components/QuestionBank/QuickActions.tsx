// components/QuestionBank/QuickActions.tsx
import { Plus, BookOpen, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onCreateQuestion: () => void;
  onImportQuestions: () => void;
  onViewAnalytics: () => void;
}

const QuickActions = ({
  onCreateQuestion,
  onImportQuestions,
  onViewAnalytics
}: QuickActionsProps) => (
  <div className="card p-6 mt-8">
    <h3 className="font-mono text-lg font-semibold mb-4">Quick Actions</h3>
    <div className="flex flex-wrap gap-3">
      <button
        className="btn-primary flex items-center gap-2"
        onClick={onCreateQuestion}
      >
        <Plus className="w-4 h-4" />
        Create Question
      </button>
      <button
        className="btn-secondary flex items-center gap-2"
        onClick={onImportQuestions}
      >
        <BookOpen className="w-4 h-4" />
        Import Questions
      </button>
      <button
        className="btn-secondary flex items-center gap-2"
        onClick={onViewAnalytics}
      >
        <BarChart3 className="w-4 h-4" />
        View Analytics
      </button>
    </div>
  </div>
);

export default QuickActions;
