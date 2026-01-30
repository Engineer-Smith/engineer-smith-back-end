// components/QuestionBank/SkillCard.tsx
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Skill {
  name: string;
  skill: string;
  description: string;
  icon: LucideIcon;
  color: string;
  subCategories?: string[];
}

interface SkillCardProps {
  skill: Skill;
  count: number;
  loading: boolean;
  onClick: () => void;
  subCategoryBreakdown?: { [key: string]: number };
  maxCount?: number;
}

const colorClasses: Record<string, { bg: string; text: string; badge: string }> = {
  primary: { bg: 'bg-blue-500/10', text: 'text-blue-500', badge: 'badge-blue' },
  success: { bg: 'bg-green-500/10', text: 'text-green-500', badge: 'badge-green' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-500', badge: 'badge-amber' },
  danger: { bg: 'bg-red-500/10', text: 'text-red-500', badge: 'badge-red' },
  info: { bg: 'bg-purple-500/10', text: 'text-purple-500', badge: 'badge-purple' },
  secondary: { bg: 'bg-gray-500/10', text: 'text-gray-400', badge: 'badge-gray' },
};

const SkillCard = ({
  skill,
  count,
  loading,
  onClick,
  subCategoryBreakdown,
  maxCount = 100
}: SkillCardProps) => {
  const progressPercentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const colors = colorClasses[skill.color] || colorClasses.primary;
  const Icon = skill.icon;

  return (
    <div
      className="card-hover p-5 h-full flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors.bg}`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        <div className="flex items-center gap-2">
          {!loading && (
            <span className={colors.badge}>
              {count} questions
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-[#6b6b70]" />
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="font-mono text-lg font-semibold mb-2">
          {skill.name}
        </h3>
        <p className="text-[#6b6b70] text-sm mb-4">
          {skill.description}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-[#2a2a2e] rounded-full overflow-hidden mb-1">
            <div
              className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-[#6b6b70]">
            {progressPercentage.toFixed(0)}% of largest category
          </p>
        </div>

        {/* Sub-category breakdown */}
        {skill.subCategories && subCategoryBreakdown && (
          <div className="mb-4">
            <p className="text-xs text-[#6b6b70] mb-2">Breakdown:</p>
            <div className="space-y-1">
              {skill.subCategories.map(subCat => (
                <div key={subCat} className="flex justify-between items-center">
                  <span className="text-xs capitalize text-[#a1a1aa]">{subCat}:</span>
                  <span className="badge-gray text-xs">
                    {subCategoryBreakdown[subCat] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-3 border-t border-[#2a2a2e]">
        <p className="text-xs text-[#6b6b70]">
          {loading ? 'Loading...' : `${count} questions available`}
        </p>
      </div>
    </div>
  );
};

export default SkillCard;
