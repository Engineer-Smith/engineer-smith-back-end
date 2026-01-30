// components/Dashboard/RecentResults.tsx
import React from 'react';
import { BarChart3 } from 'lucide-react';
import type { Result } from '../../types';

interface RecentResultsProps {
  results: Result[];
}

export const RecentResults: React.FC<RecentResultsProps> = ({ results }) => {
  return (
    <div className="card h-full">
      <div className="p-4 border-b border-[#2a2a2e]">
        <h5 className="font-mono text-lg font-semibold flex items-center gap-2 mb-0">
          <BarChart3 className="w-5 h-5 text-green-500" />
          Recent Results
        </h5>
      </div>
      <div className="p-4">
        {results.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-8 h-8 text-[#6b6b70] mx-auto mb-3" />
            <p className="text-[#a1a1aa]">No results yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2e]">
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Score</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Result</th>
                  <th className="text-left py-2 text-[#6b6b70] font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 5).map((result) => {
                  const percentage = (result.score.earnedPoints / result.score.totalPoints) * 100;
                  return (
                    <tr key={result._id} className="border-b border-[#2a2a2e] last:border-0">
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 progress-bar">
                            <div
                              className={`progress-fill ${result.score.passed ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <small className="text-[#a1a1aa]">
                            {result.score.earnedPoints}/{result.score.totalPoints}
                          </small>
                        </div>
                      </td>
                      <td className="py-2">
                        <span className={result.score.passed ? 'badge-green' : 'badge-red'}>
                          {result.score.passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="py-2">
                        <small className="text-[#6b6b70]">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
