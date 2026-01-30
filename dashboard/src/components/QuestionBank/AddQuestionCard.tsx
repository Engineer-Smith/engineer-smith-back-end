// components/QuestionBank/AddQuestionCard.tsx
import { Plus } from 'lucide-react';

interface AddQuestionCardProps {
  onClick: () => void;
}

const AddQuestionCard = ({ onClick }: AddQuestionCardProps) => (
  <div
    className="card h-full flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-[#2a2a2e] hover:border-green-500/50 hover:bg-green-500/5 transition-all cursor-pointer"
    onClick={onClick}
  >
    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
      <Plus className="w-7 h-7 text-green-500" />
    </div>

    <h3 className="font-mono text-lg font-semibold mb-2">
      Add New Question
    </h3>
    <p className="text-[#6b6b70] text-sm mb-6">
      Create a new question for the bank
    </p>

    <button className="btn-primary flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Create Question
    </button>
  </div>
);

export default AddQuestionCard;
