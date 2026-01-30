// components/Dashboard/AvailableTests.tsx
import React from 'react';
import { ClipboardList, Play } from 'lucide-react';
import type { Test, TestType, Language } from '../../types';

interface AvailableTestsProps {
  tests: Test[];
  onStartTest: (testId: string) => void;
  loading: boolean;
}

export const AvailableTests: React.FC<AvailableTestsProps> = ({
  tests,
  onStartTest,
  loading
}) => {
  const getTestTypeBadgeClass = (testType: TestType): string => {
    const classes: Record<TestType, string> = {
      frontend_basics: 'badge-blue',
      react_developer: 'badge-purple',
      fullstack_js: 'badge-green',
      mobile_development: 'badge-amber',
      python_developer: 'badge-gray',
      custom: 'badge-gray'
    };
    return classes[testType] || 'badge-gray';
  };

  const formatLanguages = (languages: Language[]): string => {
    return languages.length > 0 ? languages.join(', ') : 'General';
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-[#2a2a2e]">
        <div className="flex justify-between items-center">
          <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            Available Tests
          </h5>
          <span className="badge-purple">{tests.length} tests</span>
        </div>
      </div>
      <div className="p-4">
        {tests.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-[#6b6b70] mx-auto mb-3" />
            <p className="text-[#a1a1aa]">No tests available at the moment</p>
            <p className="text-sm text-[#6b6b70]">Check back later for new assessments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.slice(0, 6).map((test) => (
              <div key={test._id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={getTestTypeBadgeClass(test.testType)}>
                    {test.testType.replace('_', ' ')}
                  </span>
                  <small className="text-[#6b6b70]">
                    {test.settings.timeLimit}min
                  </small>
                </div>
                <h6 className="font-mono text-sm font-semibold mb-2">
                  {test.title}
                </h6>
                <p className="text-[#6b6b70] text-sm mb-3 line-clamp-2">
                  {test.description}
                </p>
                <div className="mb-3 text-sm">
                  <div className="text-[#6b6b70]">
                    <strong className="text-[#a1a1aa]">Languages:</strong> {formatLanguages(test.languages)}
                  </div>
                  <div className="text-[#6b6b70]">
                    <strong className="text-[#a1a1aa]">Attempts:</strong> {test.settings.attemptsAllowed}
                  </div>
                </div>
                <button
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  onClick={() => onStartTest(test._id)}
                  disabled={loading}
                >
                  <Play className="w-4 h-4" />
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
