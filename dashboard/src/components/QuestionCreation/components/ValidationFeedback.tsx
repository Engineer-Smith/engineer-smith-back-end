// src/components/questions/components/ValidationFeedback.tsx - Display validation errors/warnings

import React from 'react';
import { AlertTriangle, XCircle, Info, CheckCircle } from 'lucide-react';
import type { ValidationResult } from '../../../services/questionValidationService';

interface ValidationFeedbackProps {
  validation: ValidationResult;
  className?: string;
  showWarnings?: boolean;
  showBusinessRules?: boolean;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  validation,
  className = '',
  showWarnings = true,
  showBusinessRules = true
}) => {
  const { errors, warnings, businessRuleViolations, isValid } = validation;

  if (isValid && errors.length === 0 && warnings.length === 0) {
    return (
      <div className={`p-4 bg-green-500/10 border border-green-500/25 rounded-lg ${className}`}>
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-400" />
          <strong className="text-green-400">Question validation passed!</strong>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg mb-3">
          <div className="flex gap-2">
            <XCircle size={16} className="text-red-400 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <strong className="text-red-400">
                {errors.length} Error{errors.length > 1 ? 's' : ''} Found
              </strong>
              <ul className="mt-2 space-y-1 text-[#a1a1aa]">
                {errors.map((error, index) => (
                  <li key={index}>
                    <strong className="text-[#f5f5f4]">{error.field}:</strong> {error.message}
                    {error.code && (
                      <span className="badge-red ml-2 text-xs">
                        {error.code}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {showWarnings && warnings.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-3">
          <div className="flex gap-2">
            <AlertTriangle size={16} className="text-amber-400 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <strong className="text-amber-400">
                {warnings.length} Warning{warnings.length > 1 ? 's' : ''}
              </strong>
              <ul className="mt-2 space-y-1 text-[#a1a1aa]">
                {warnings.map((warning, index) => (
                  <li key={index}>
                    <strong className="text-[#f5f5f4]">{warning.field}:</strong> {warning.message}
                    {warning.code && (
                      <span className="badge-amber ml-2 text-xs">
                        {warning.code}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Business Rule Violations */}
      {showBusinessRules && businessRuleViolations.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-3">
          <div className="flex gap-2">
            <Info size={16} className="text-blue-400 mt-1 flex-shrink-0" />
            <div className="flex-grow">
              <strong className="text-blue-400">Business Rule Information</strong>
              <ul className="mt-2 space-y-2 text-[#a1a1aa]">
                {businessRuleViolations.map((violation, index) => (
                  <li key={index}>
                    <span className="text-[#6b6b70]">{violation.field}:</span> {violation.message}
                    {violation.suggestion && (
                      <div className="text-[#6b6b70] text-sm mt-1">
                        <strong>Suggestion:</strong> {violation.suggestion}
                      </div>
                    )}
                    <span className={`ml-2 text-xs ${violation.severity === 'error' ? 'badge-red' : 'badge-amber'}`}>
                      {violation.code}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;
