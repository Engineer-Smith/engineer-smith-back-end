import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Lightbulb, AlertCircle } from 'lucide-react';
import { DifficultyBadge, TopicTags } from '../shared';
import type { PublicChallenge } from '../../../types/codeChallenge';

interface ChallengeProblemPaneProps {
  challenge: PublicChallenge;
  hintsRevealed: number;
  onRevealHint: () => void;
}

const ChallengeProblemPane: React.FC<ChallengeProblemPaneProps> = ({
  challenge,
  hintsRevealed,
  onRevealHint
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    examples: true,
    constraints: true,
    hints: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader: React.FC<{ title: string; section: string; icon?: React.ReactNode }> = ({
    title,
    section,
    icon
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-2 text-left"
    >
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-medium text-[#f5f5f4]">{title}</h3>
      </div>
      {expandedSections[section] ? (
        <ChevronDown className="w-4 h-4 text-[#6b6b70]" />
      ) : (
        <ChevronRight className="w-4 h-4 text-[#6b6b70]" />
      )}
    </button>
  );

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Title and Badges */}
      <div>
        <h2 className="font-mono text-xl font-bold text-[#f5f5f4] mb-2">
          {challenge.title}
        </h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <DifficultyBadge difficulty={challenge.difficulty} size="md" />
          <TopicTags topics={challenge.topics} size="sm" maxDisplay={3} />
        </div>
      </div>

      {/* Description Section */}
      <div className="border-t border-[#2a2a2e] pt-4">
        <SectionHeader title="Description" section="description" />
        {expandedSections.description && (
          <div className="mt-2 text-sm text-[#a1a1aa] leading-relaxed whitespace-pre-wrap">
            {challenge.problemStatement || challenge.description}
          </div>
        )}
      </div>

      {/* Examples Section */}
      {challenge.examples && challenge.examples.length > 0 && (
        <div className="border-t border-[#2a2a2e] pt-4">
          <SectionHeader title="Examples" section="examples" />
          {expandedSections.examples && (
            <div className="mt-2 space-y-4">
              {challenge.examples.map((example, index) => (
                <div key={index} className="bg-[#0a0a0b] rounded-lg p-3 border border-[#1c1c1f]">
                  <div className="text-xs text-[#6b6b70] mb-2">Example {index + 1}</div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-[#6b6b70]">Input:</span>
                      <pre className="text-sm text-[#f5f5f4] font-mono mt-1 bg-[#1c1c1f] p-2 rounded overflow-x-auto">
                        {typeof example.input === 'string' ? example.input : JSON.stringify(example.input, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs text-[#6b6b70]">Output:</span>
                      <pre className="text-sm text-[#f5f5f4] font-mono mt-1 bg-[#1c1c1f] p-2 rounded overflow-x-auto">
                        {typeof example.output === 'string' ? example.output : JSON.stringify(example.output, null, 2)}
                      </pre>
                    </div>
                    {example.explanation && (
                      <div>
                        <span className="text-xs text-[#6b6b70]">Explanation:</span>
                        <p className="text-sm text-[#a1a1aa] mt-1">{example.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Constraints Section */}
      {challenge.constraints && challenge.constraints.length > 0 && (
        <div className="border-t border-[#2a2a2e] pt-4">
          <SectionHeader
            title="Constraints"
            section="constraints"
            icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
          />
          {expandedSections.constraints && (
            <ul className="mt-2 space-y-1">
              {challenge.constraints.map((constraint, index) => (
                <li key={index} className="text-sm text-[#a1a1aa] flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <code className="font-mono text-xs bg-[#1c1c1f] px-1 py-0.5 rounded">
                    {constraint}
                  </code>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Hints Section */}
      {challenge.hints && challenge.hints.length > 0 && (
        <div className="border-t border-[#2a2a2e] pt-4">
          <SectionHeader
            title={`Hints (${hintsRevealed}/${challenge.hints.length})`}
            section="hints"
            icon={<Lightbulb className="w-4 h-4 text-yellow-400" />}
          />
          {expandedSections.hints && (
            <div className="mt-2 space-y-2">
              {challenge.hints.map((hint, index) => (
                <div key={index}>
                  {index < hintsRevealed ? (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <span className="text-xs text-yellow-400 block mb-1">Hint {index + 1}</span>
                      <p className="text-sm text-[#a1a1aa]">{hint}</p>
                    </div>
                  ) : index === hintsRevealed ? (
                    <button
                      onClick={onRevealHint}
                      className="w-full p-3 border border-dashed border-[#2a2a2e] rounded-lg text-sm text-[#6b6b70] hover:border-yellow-500/30 hover:text-yellow-400 transition-colors"
                    >
                      Click to reveal Hint {index + 1}
                    </button>
                  ) : (
                    <div className="p-3 border border-[#1c1c1f] rounded-lg text-sm text-[#3a3a3f]">
                      Hint {index + 1} (locked)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Complexity Info */}
      {(challenge.timeComplexity || challenge.spaceComplexity) && (
        <div className="border-t border-[#2a2a2e] pt-4">
          <h3 className="text-xs text-[#6b6b70] mb-2">Expected Complexity</h3>
          <div className="flex gap-4 text-sm">
            {challenge.timeComplexity && (
              <div>
                <span className="text-[#6b6b70]">Time: </span>
                <code className="font-mono text-green-400">{challenge.timeComplexity}</code>
              </div>
            )}
            {challenge.spaceComplexity && (
              <div>
                <span className="text-[#6b6b70]">Space: </span>
                <code className="font-mono text-blue-400">{challenge.spaceComplexity}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeProblemPane;
