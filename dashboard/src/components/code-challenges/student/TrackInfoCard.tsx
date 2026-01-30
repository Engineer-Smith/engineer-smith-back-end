import React from 'react';
import { Target, BookOpen, Award } from 'lucide-react';

interface TrackInfoCardProps {
  learningObjectives: string[];
  prerequisites: string[];
  estimatedHours: number;
  category: string;
}

const TrackInfoCard: React.FC<TrackInfoCardProps> = ({
  learningObjectives,
  prerequisites,
  estimatedHours,
  category
}) => {
  const formatCategory = (cat: string) => {
    return cat
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h3 className="font-mono font-semibold text-[#f5f5f4]">Track Info</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* Category */}
        <div className="p-3 bg-[#0a0a0b] rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-[#a1a1aa]">Category</span>
          </div>
          <p className="text-sm text-[#f5f5f4]">{formatCategory(category)}</p>
        </div>

        {/* Learning Objectives */}
        {learningObjectives.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-[#f5f5f4]">Learning Goals</span>
            </div>
            <ul className="space-y-2">
              {learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                  <span className="text-green-400 mt-1">•</span>
                  {objective}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites */}
        {prerequisites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-[#f5f5f4]">Prerequisites</span>
            </div>
            <ul className="space-y-2">
              {prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                  <span className="text-amber-400 mt-1">•</span>
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estimated Time */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <strong>Estimated time:</strong> {estimatedHours} hours to complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackInfoCard;
