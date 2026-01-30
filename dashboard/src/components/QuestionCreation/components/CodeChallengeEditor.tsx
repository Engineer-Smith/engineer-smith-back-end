// src/components/QuestionCreation/components/CodeChallengeEditor.tsx - Advanced Settings with Pre-selected Values
import React, { useEffect, useState } from 'react';
import { Info, Zap, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import SafeMonacoEditor from '../../SafeMonacoEditor';
import type { CreateQuestionData } from '../../../types';

interface CodeChallengeEditorProps {
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
  performanceRecommendations?: string[];
  selectedLanguage: string;
  selectedCategory: string;
}

const CodeChallengeEditor: React.FC<CodeChallengeEditorProps> = ({
  questionData,
  onInputChange,
  validation,
  isFieldRequired = () => false,
  functionSignatures = [],
  performanceRecommendations = [],
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
      <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mb-4 flex items-start">
        <Info size={16} className="text-blue-400 mr-2 mt-0.5" />
        <div className="text-blue-400">
          <strong>Code Challenge Setup</strong>
          <div className="mt-2">
            {requiresTestCases ? (
              <>Code challenge questions require test cases to validate solutions. Complete the configuration here, then add test cases in the next step.</>
            ) : (
              <>UI and syntax code challenges focus on implementation without automated testing.</>
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
                The function name that students must implement
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
                    You can adjust these settings if needed for specific requirements.
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Function Signatures Help */}
      {functionSignatures.length > 0 && (
        <div className="p-4 bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg mb-4">
          <div className="flex items-center text-[#a1a1aa] mb-2">
            <Zap size={16} className="mr-2" />
            <strong>Common {selectedLanguage} Functions:</strong>
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

      {/* Code Template/Starter Code */}
      <div className="mb-4">
        <label className="block text-[#a1a1aa] font-semibold mb-2">
          Starter Code Template {isFieldRequired('codeTemplate') && <span className="text-red-400">*</span>}
        </label>
        <SafeMonacoEditor
          height="300px"
          language={getLanguageForMonaco(selectedLanguage)}
          value={questionData.codeTemplate || ''}
          onChange={(value) => onInputChange('codeTemplate', value || '')}
          placeholder={`// Write starter code for students in ${selectedLanguage}\n// Students will complete this implementation\n\n${requiresTestCases ? `function ${questionData.codeConfig?.entryFunction || 'solution'}() {\n    // TODO: Implement solution\n    return null;\n}` : '// Provide starter code or template here'}`}
          options={{
            lineNumbers: 'on',
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
        />
        <small className="text-[#6b6b70]">
          {requiresTestCases
            ? 'Provide starter code that students will complete. Include the entry function signature.'
            : 'Provide template or starter code for students to build upon.'
          }
        </small>
      </div>

      {/* Performance Recommendations */}
      {performanceRecommendations.length > 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-3 flex items-start">
          <Info size={16} className="text-blue-400 mr-2 mt-0.5" />
          <div className="text-blue-400">
            <strong>Performance Tips for {selectedLanguage}:</strong>
            <ul className="mb-0 mt-2 list-disc list-inside">
              {performanceRecommendations.slice(0, 3).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Next Step Preview */}
      {requiresTestCases && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-4 flex items-start">
          <Info size={16} className="text-blue-400 mr-2 mt-0.5" />
          <span className="text-blue-400">
            <strong>Next Step:</strong> You'll add test cases to validate student solutions.
            Test cases will check if the <code className="bg-[#1a1a1e] px-1 rounded">{questionData.codeConfig?.entryFunction || 'function'}</code> returns correct outputs for given inputs.
          </span>
        </div>
      )}
    </div>
  );
};

export default CodeChallengeEditor;
