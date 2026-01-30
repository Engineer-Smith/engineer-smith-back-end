// components/QuestionBank/QuestionBankHeader.tsx
import { BookOpen, Globe } from 'lucide-react';
import type { User } from '../../types';

interface QuestionBankHeaderProps {
  user: User;
}

const QuestionBankHeader = ({ user }: QuestionBankHeaderProps) => (
  <div className="bg-[#141416] border-b border-[#2a2a2e]">
    <div className="container-section py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold">Question Bank</h1>
            <p className="text-[#6b6b70] text-sm">
              {user?.organization?.isSuperOrg
                ? "Manage global and organization-specific questions"
                : `Manage questions for ${user?.organization?.name}`
              }
            </p>
          </div>
        </div>
        {user?.organization?.isSuperOrg && (
          <span className="badge-blue flex items-center gap-2">
            <Globe className="w-3 h-3" />
            Super Admin Access
          </span>
        )}
      </div>
    </div>
  </div>
);

export default QuestionBankHeader;
