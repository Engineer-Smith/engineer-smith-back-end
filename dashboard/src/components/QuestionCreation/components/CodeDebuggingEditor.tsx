// src/components/QuestionCreation/components/CodeDebuggingEditor.tsx - Fixed with Auto Runtime
import React, { useEffect, useState } from 'react';
import { Bug, Shield, Info, AlertTriangle, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import SafeMonacoEditor from '../../SafeMonacoEditor';
import type { CreateQuestionData } from '../../../types';

interface CodeDebuggingEditorProps {
  questionData: Partial<CreateQuestionData>;
  onInputChange: (field: keyof CreateQuestionData, value: any) => void;
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  isFieldRequired?: (field: string) => boolean;
  availableRuntimes?: Array<{
    id: string;
    name: string;
    description: string;
    language: string;
    defaultTimeout: number;
  }>;
  functionSignatures?: Array<{
    name: string;
    description: string;
    example?: string;
  }>;
  securityRecommendations?: string[];
  selectedLanguage: string;
  selectedCategory: string;
}

const CodeDebuggingEditor: React.FC<CodeDebuggingEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  functionSignatures = [],
  securityRecommendations = [],
  selectedLanguage,
  selectedCategory
}) => {
  const requiresTestCases = selectedCategory === 'logic';
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Auto-determine runtime based on selected language
  const getAutoRuntime = (language: string): string => {
    const languageRuntimeMap: Record<string, string> = {
      'javascript': 'node',
      'typescript': 'node',
      'react': 'node',
      'reactNative': 'node',
      'express': 'node',
      'python': 'python',
      'sql': 'sql',
      'dart': 'dart',
      'flutter': 'dart'
    };

    return languageRuntimeMap[language] || 'node';
  };

  // Get recommended timeout based on language
  const getRecommendedTimeout = (language: string): number => {
    const timeouts: Record<string, number> = {
      'javascript': 3000,
      'typescript': 3500,
      'react': 3000,
      'reactNative': 4000,
      'express': 5000,
      'python': 3000,
      'sql': 2000,
      'dart': 3000,
      'flutter': 4000
    };

    return timeouts[language] || 3000;
  };

  // Auto-set runtime and timeout when language changes
  useEffect(() => {
    if (selectedLanguage && requiresTestCases) {
      const autoRuntime = getAutoRuntime(selectedLanguage);
      const recommendedTimeout = getRecommendedTimeout(selectedLanguage);

      // Only update if not already set or different
      const currentConfig = questionData.codeConfig;
      const needsRuntimeUpdate = !currentConfig?.runtime || currentConfig.runtime !== autoRuntime;
      const needsTimeoutUpdate = !currentConfig?.timeoutMs || currentConfig.timeoutMs === 3000;

      if (needsRuntimeUpdate || needsTimeoutUpdate) {
        onInputChange('codeConfig', {
          ...currentConfig,
          ...(needsRuntimeUpdate && { runtime: autoRuntime }),
          ...(needsTimeoutUpdate && { timeoutMs: recommendedTimeout })
        });
      }
    }
  }, [selectedLanguage, requiresTestCases]);

  const handleCodeConfigChange = (field: string, value: any) => {
    onInputChange('codeConfig', {
      ...questionData.codeConfig,
      [field]: value
    });
  };

  const getLanguageForMonaco = (language: string): string => {
    const mapping: Record<string, string> = {
      'javascript': 'javascript',
      'typescript': 'typescript',
      'python': 'python',
      'java': 'java',
      'csharp': 'csharp',
      'cpp': 'cpp',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'dart': 'dart'
    };
    return mapping[language] || 'javascript';
  };

  // Get display name for runtime
  const getRuntimeDisplayName = (runtimeId: string, language: string): string => {
    const displayNames: Record<string, string> = {
      'node': 'Node.js',
      'python': 'Python',
      'sql': 'SQL Engine',
      'dart': 'Dart VM'
    };

    return displayNames[runtimeId] || `${language} Runtime`;
  };

  return (
    <div>
      {/* Info Alert */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mb-4 flex items-start">
        <Bug size={16} className="text-amber-400 mr-2 mt-0.5" />
        <div className="text-amber-400">
          <strong>Code Debugging Question</strong>
          <div className="mt-2">
            Students will be given buggy code and must identify and fix the issues to make it work correctly.
            {requiresTestCases && (
              <> Test cases will verify their fixes are correct.</>
            )}
          </div>
        </div>
      </div>

      {/* Logic Category Configuration */}
      {requiresTestCases && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-[#a1a1aa] font-semibold mb-2">
                Entry Function Name {isFieldRequired('codeConfig.entryFunction') && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={questionData.codeConfig?.entryFunction || ''}
                onChange={(e) => handleCodeConfigChange('entryFunction', e.target.value)}
                placeholder="e.g., solution, calculate, process"
                className={`input w-full ${validation?.errors.some(e => e.includes('entryFunction')) ? 'border-red-500' : ''}`}
              />
              <small className="text-[#6b6b70]">
                The main function that will be tested
              </small>
            </div>

            <div>
              <label className="block text-[#a1a1aa] font-semibold mb-2">Question Category</label>
              <input type="text" value={selectedCategory} disabled className="input w-full opacity-60" />
              <small className="text-[#6b6b70]">Logic questions require test cases</small>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="mb-4">
            <button
              type="button"
              className="btn-secondary text-sm flex items-center"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings size={14} className="mr-2" />
              Advanced Settings
              {showAdvanced ? <ChevronUp size={14} className="ml-2" /> : <ChevronDown size={14} className="ml-2" />}
            </button>

            {showAdvanced && (
              <div className="border border-[#2a2a2e] rounded-lg p-4 mt-3 bg-[#1a1a1e]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#a1a1aa] font-semibold mb-2">Runtime Environment</label>
                    <select
                      value={questionData.codeConfig?.runtime || getAutoRuntime(selectedLanguage)}
                      onChange={(e) => handleCodeConfigChange('runtime', e.target.value)}
                      className="select w-full"
                    >
                      <option value="node">Node.js - JavaScript/TypeScript runtime</option>
                      <option value="python">Python - Python runtime</option>
                      <option value="sql">SQL Engine - Database queries</option>
                      <option value="dart">Dart VM - Dart/Flutter runtime</option>
                    </select>
                    <small className="text-[#6b6b70]">
                      Auto-selected based on language: {getRuntimeDisplayName(questionData.codeConfig?.runtime || getAutoRuntime(selectedLanguage), selectedLanguage)}
                    </small>
                  </div>

                  <div>
                    <label className="block text-[#a1a1aa] font-semibold mb-2">Execution Timeout (ms)</label>
                    <input
                      type="number"
                      value={questionData.codeConfig?.timeoutMs || getRecommendedTimeout(selectedLanguage)}
                      onChange={(e) => handleCodeConfigChange('timeoutMs', parseInt(e.target.value) || 3000)}
                      min={100}
                      max={30000}
                      step={500}
                      className="input w-full"
                    />
                    <small className="text-[#6b6b70]">
                      Recommended for {selectedLanguage}: {getRecommendedTimeout(selectedLanguage)}ms
                    </small>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-3 flex items-start text-sm">
                  <Info size={14} className="text-blue-400 mr-2 mt-0.5" />
                  <span className="text-blue-400">
                    <strong>Note:</strong> Runtime and timeout are automatically configured based on your selected language.
                    You can adjust these settings if needed for specific debugging scenarios.
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Buggy Code */}
      <div className="mb-4">
        <label className="block text-[#a1a1aa] font-semibold mb-2">
          Buggy Code {isFieldRequired('buggyCode') && <span className="text-red-400">*</span>}
        </label>
        <SafeMonacoEditor
          height="300px"
          language={getLanguageForMonaco(selectedLanguage)}
          value={questionData.buggyCode || ''}
          onChange={(value) => onInputChange('buggyCode', value || '')}
          placeholder={`// Write buggy ${selectedLanguage} code that students must fix\n// Include common mistakes, logic errors, or syntax issues\n\n${requiresTestCases ? `function ${questionData.codeConfig?.entryFunction || 'solution'}(input) {\n    // Buggy implementation here\n    // Example: off-by-one error, incorrect logic, etc.\n    return input + 1; // This might be wrong!\n}` : '// Provide buggy code here'}`}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
        <small className="text-[#6b6b70]">
          Code that contains bugs for students to find and fix. Make the bugs realistic and educational.
        </small>
      </div>

      {/* Solution Code */}
      <div className="mb-4">
        <label className="block text-[#a1a1aa] font-semibold mb-2">
          Correct Solution {isFieldRequired('solutionCode') && <span className="text-red-400">*</span>}
        </label>
        <SafeMonacoEditor
          height="300px"
          language={getLanguageForMonaco(selectedLanguage)}
          value={questionData.solutionCode || ''}
          onChange={(value) => onInputChange('solutionCode', value || '')}
          placeholder={`// Write the correct ${selectedLanguage} solution\n// This is what the buggy code should look like when fixed\n\n${requiresTestCases ? `function ${questionData.codeConfig?.entryFunction || 'solution'}(input) {\n    // Correct implementation here\n    return input * 2; // Correct logic\n}` : '// Provide correct solution here'}`}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
        <small className="text-[#6b6b70]">
          The corrected version of the buggy code. This will be used for grading and reference.
        </small>
      </div>

      {/* Function Signatures Help */}
      {functionSignatures.length > 0 && (
        <div className="p-4 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg mb-4">
          <div className="flex items-center text-[#a1a1aa] mb-2">
            <Info size={16} className="mr-2" />
            <strong>Common {selectedLanguage} Patterns:</strong>
          </div>
          <div className="mt-2">
            {functionSignatures.slice(0, 3).map((sig, index) => (
              <div key={index} className="mb-1">
                <code className="text-blue-400">{sig.name}</code>: <span className="text-[#a1a1aa]">{sig.description}</span>
                {sig.example && <div className="text-[#6b6b70] text-sm mt-1">{sig.example}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      {securityRecommendations.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-3 flex items-start">
          <Shield size={16} className="text-blue-400 mr-2 mt-0.5" />
          <div className="text-blue-400">
            <strong>Security Best Practices for {selectedLanguage}:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {securityRecommendations.slice(0, 3).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Common Bug Types */}
      <div className="p-4 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg mt-3">
        <div className="flex items-center text-amber-400 mb-2">
          <AlertTriangle size={16} className="mr-2" />
          <strong>Common Bug Types to Include:</strong>
        </div>
        <ul className="mb-0 mt-2 list-disc list-inside text-[#a1a1aa]">
          <li><strong className="text-[#f5f5f4]">Logic Errors:</strong> Off-by-one errors, incorrect conditions</li>
          <li><strong className="text-[#f5f5f4]">Type Issues:</strong> Wrong data types, type conversion problems</li>
          <li><strong className="text-[#f5f5f4]">Edge Cases:</strong> Missing handling for null, empty, or boundary values</li>
          <li><strong className="text-[#f5f5f4]">Algorithm Issues:</strong> Inefficient or incorrect algorithms</li>
        </ul>
      </div>

      {/* Next Step Preview */}
      {requiresTestCases && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-4 flex items-start">
          <Info size={16} className="text-blue-400 mr-2 mt-0.5" />
          <span className="text-blue-400">
            <strong>Next Step:</strong> Add test cases to verify that student fixes work correctly.
            Test cases will run against both the buggy code (should fail) and the solution (should pass).
          </span>
        </div>
      )}

      {/* Validation Warnings */}
      {validation?.warnings && validation.warnings.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg mt-3 flex items-start">
          <AlertTriangle size={16} className="text-amber-400 mr-2 mt-0.5" />
          <div className="text-amber-400">
            <strong>Recommendations:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeDebuggingEditor;
