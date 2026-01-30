// src/components/admin/dashboard/FeatureSection.tsx
import React from 'react';
import FeatureCard from './FeatureCard';
import type { DashboardFeature } from '../../../types';

interface FeatureSectionProps {
  title: string;
  subtitle: string;
  features: DashboardFeature[];
  onNavigate: (path: string) => void;
  sectionKey: string;
  badge?: React.ReactNode;
}

const FeatureSection: React.FC<FeatureSectionProps> = ({
  title,
  subtitle,
  features,
  onNavigate,
  sectionKey,
  badge
}) => {
  if (features.length === 0) return null;

  return (
    <>
      <div className="mb-4">
        <h4 className="font-mono text-lg font-semibold text-[#a1a1aa] mb-1 flex items-center gap-2">
          {title}
          {badge}
        </h4>
        <small className="text-[#6b6b70]">{subtitle}</small>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={`${sectionKey}-${feature.title}-${index}`}
            feature={feature}
            onClick={onNavigate}
          />
        ))}
      </div>
    </>
  );
};

export default FeatureSection;
