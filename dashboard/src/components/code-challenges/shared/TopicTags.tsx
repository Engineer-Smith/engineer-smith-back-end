import React from 'react';
import { Tag } from 'lucide-react';

interface TopicTagsProps {
  topics: string[];
  maxDisplay?: number;
  size?: 'sm' | 'md';
  className?: string;
}

const TopicTags: React.FC<TopicTagsProps> = ({
  topics,
  maxDisplay = 3,
  size = 'md',
  className = ''
}) => {
  if (!topics || topics.length === 0) return null;

  const displayedTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-1.5 py-0.5 text-xs';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const formatTopicLabel = (topic: string) => {
    return topic
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {displayedTopics.map((topic, index) => (
        <span
          key={index}
          className={`
            inline-flex items-center gap-1 rounded
            bg-[#1c1c1f] text-[#a1a1aa] border border-[#2a2a2e]
            hover:border-[#3a3a3f] transition-colors
            ${getSizeClasses()}
          `}
        >
          <Tag size={10} />
          {formatTopicLabel(topic)}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={`
            inline-flex items-center rounded
            bg-[#1c1c1f] text-[#6b6b70] border border-[#2a2a2e]
            ${getSizeClasses()}
          `}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

export default TopicTags;
