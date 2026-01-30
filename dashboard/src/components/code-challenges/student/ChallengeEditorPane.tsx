import React from 'react';
import { RotateCcw, Settings } from 'lucide-react';
import SafeMonacoEditor from '../../SafeMonacoEditor';
import type { ProgrammingLanguage } from '../../../types/codeChallenge';

interface ChallengeEditorPaneProps {
  code: string;
  language: ProgrammingLanguage;
  supportedLanguages: ProgrammingLanguage[];
  onCodeChange: (code: string) => void;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  onReset: () => void;
  startingCode: Record<ProgrammingLanguage, string>;
  disabled?: boolean;
}

const ChallengeEditorPane: React.FC<ChallengeEditorPaneProps> = ({
  code,
  language,
  supportedLanguages,
  onCodeChange,
  onLanguageChange,
  onReset,
  startingCode,
  disabled = false
}) => {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'JavaScript';
      case 'python':
        return 'Python';
      case 'dart':
        return 'Dart';
      default:
        return lang;
    }
  };

  const getMonacoLanguage = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'javascript';
      case 'python':
        return 'python';
      case 'dart':
        return 'dart';
      default:
        return 'javascript';
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to starting template? Your changes will be lost.')) {
      onCodeChange(startingCode[language] || '');
      onReset();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2a2a2e] bg-[#0a0a0b]">
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value as ProgrammingLanguage;
              if (code !== startingCode[language]) {
                if (window.confirm('Changing language will load your saved solution or reset to starting code. Continue?')) {
                  onLanguageChange(newLang);
                  // Note: Parent component's onLanguageChange handles loading saved solution or starting code
                }
              } else {
                onLanguageChange(newLang);
              }
            }}
            disabled={disabled}
            className="bg-[#1c1c1f] text-[#f5f5f4] border border-[#2a2a2e] rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {getLanguageLabel(lang)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Button */}
          <button
            onClick={handleReset}
            disabled={disabled}
            className="flex items-center gap-1 px-2 py-1 text-sm text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] rounded transition-colors disabled:opacity-50"
            title="Reset to starting code"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Settings Button (placeholder for future features) */}
          <button
            className="p-1 text-[#6b6b70] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] rounded transition-colors"
            title="Editor settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <SafeMonacoEditor
          height="100%"
          language={getMonacoLanguage(language)}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          readOnly={disabled}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            padding: { top: 10, bottom: 10 },
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            folding: true,
            formatOnPaste: true,
            formatOnType: true
          }}
        />
      </div>
    </div>
  );
};

export default ChallengeEditorPane;
