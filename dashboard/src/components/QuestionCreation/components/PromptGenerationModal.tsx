// src/components/QuestionCreation/components/PromptGenerationModal.tsx
import React, { useState } from 'react';
import {
  CheckCircle,
  Code,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Lightbulb,
  Loader2,
  RefreshCw,
  X,
  Zap
} from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const PromptGenerationModal: React.FC = () => {
  const {
    state,
    dispatch,
    generatePrompt
  } = useQuestionCreation();

  const [copied, setCopied] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [promptType, setPromptType] = useState<'testcases' | 'content' | 'custom'>('testcases');

  const {
    promptGeneration,
    questionData,
    selectedLanguage,
    selectedCategory,
    selectedQuestionType
  } = state;

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_PROMPT_MODAL' });
    setCustomPrompt('');
    setCopied(false);
  };

  const handleCopyToClipboard = async () => {
    if (!promptGeneration.generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(promptGeneration.generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownloadPrompt = () => {
    if (!promptGeneration.generatedPrompt) return;

    const blob = new Blob([promptGeneration.generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${questionData.title || 'question'}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegeneratePrompt = () => {
    generatePrompt();
  };

  const handleGenerateCustomPrompt = () => {
    if (!customPrompt.trim()) return;

    // Generate prompt based on custom input
    const prompt = createCustomPrompt(customPrompt);
    dispatch({ type: 'SET_GENERATED_PROMPT', payload: prompt });
  };

  const createCustomPrompt = (userInput: string): string => {
    const { title, description, codeConfig } = questionData;

    return `Custom AI Prompt for ${selectedQuestionType} Question:

Question Context:
- Title: ${title || 'Untitled Question'}
- Language: ${selectedLanguage}
- Category: ${selectedCategory}
- Description: ${description || 'No description provided'}
${codeConfig?.entryFunction ? `- Function: ${codeConfig.entryFunction}` : ''}

User Request:
${userInput}

Please provide detailed assistance based on the question context and user request above.`;
  };

  const getPromptTypeInfo = () => {
    switch (promptType) {
      case 'testcases':
        return {
          title: 'Test Cases Generator',
          description: 'Generate comprehensive test cases for your code question',
          icon: Code,
          colorClass: 'border-blue-500/50 text-blue-400'
        };
      case 'content':
        return {
          title: 'Content Assistant',
          description: 'Get help with question content, examples, and explanations',
          icon: FileText,
          colorClass: 'border-cyan-500/50 text-cyan-400'
        };
      case 'custom':
        return {
          title: 'Custom AI Request',
          description: 'Ask the AI anything about your question',
          icon: Lightbulb,
          colorClass: 'border-amber-500/50 text-amber-400'
        };
      default:
        return {
          title: 'AI Assistant',
          description: 'Get AI assistance with your question',
          icon: Zap,
          colorClass: 'border-blue-500/50 text-blue-400'
        };
    }
  };

  const promptTypeInfo = getPromptTypeInfo();
  const PromptIcon = promptTypeInfo.icon;

  if (!promptGeneration.showModal) return null;

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
          <div className="flex items-center">
            <Zap size={20} className="text-blue-400 mr-2" />
            <span className="font-semibold text-[#f5f5f4]">AI Prompt Generator</span>
          </div>
          <button className="text-[#6b6b70] hover:text-[#f5f5f4]" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Prompt Type Selection */}
          <div className="mb-4">
            <label className="block text-[#a1a1aa] font-semibold mb-2">What do you need help with?</label>
            <div className="flex gap-2 flex-wrap">
              <button
                className={promptType === 'testcases' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                onClick={() => setPromptType('testcases')}
              >
                <Code size={14} className="mr-1" />
                Test Cases
              </button>
              <button
                className={promptType === 'content' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                onClick={() => setPromptType('content')}
              >
                <FileText size={14} className="mr-1" />
                Content Help
              </button>
              <button
                className={promptType === 'custom' ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
                onClick={() => setPromptType('custom')}
              >
                <Lightbulb size={14} className="mr-1" />
                Custom Request
              </button>
            </div>
          </div>

          {/* Current Selection Info */}
          <div className={`card ${promptTypeInfo.colorClass} mb-4`}>
            <div className="p-3">
              <div className="flex items-center">
                <PromptIcon size={20} className="mr-2" />
                <div>
                  <h6 className="font-semibold text-[#f5f5f4] mb-0">{promptTypeInfo.title}</h6>
                  <small className="text-[#6b6b70]">{promptTypeInfo.description}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Prompt Input */}
          {promptType === 'custom' && (
            <div className="mb-4">
              <label className="block text-[#a1a1aa] font-semibold mb-2">
                Custom Request <span className="text-red-400">*</span>
                <span className="ml-1 text-[#6b6b70] cursor-help" title="Describe what specific help you need with your question. Be as detailed as possible.">
                  <HelpCircle size={14} className="inline" />
                </span>
              </label>
              <textarea
                rows={4}
                className="input w-full"
                placeholder="e.g., Help me create edge cases for this sorting algorithm, suggest better variable names, create examples for this concept..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          )}

          {/* Question Context */}
          <div className="card bg-[#1a1a1e] mb-4">
            <div className="p-3">
              <h6 className="font-semibold text-[#f5f5f4] mb-2">Question Context</h6>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="badge-blue">{selectedQuestionType}</span>
                <span className="badge-cyan">{selectedLanguage}</span>
                <span className="badge-gray">{selectedCategory}</span>
              </div>
              <div className="text-sm">
                <div className="mb-1 text-[#a1a1aa]"><strong className="text-[#f5f5f4]">Title:</strong> {questionData.title || 'Not set'}</div>
                {questionData.codeConfig?.entryFunction && (
                  <div className="text-[#a1a1aa]"><strong className="text-[#f5f5f4]">Function:</strong> {questionData.codeConfig.entryFunction}</div>
                )}
              </div>
            </div>
          </div>

          {/* Generated Prompt Display */}
          {promptGeneration.generatedPrompt ? (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-[#f5f5f4]">Generated Prompt</label>
                <div className="flex gap-2">
                  <button
                    className="btn-secondary text-sm"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    onClick={handleDownloadPrompt}
                  >
                    <Download size={14} className="mr-1" />
                    Download
                  </button>
                  <button
                    className="btn-secondary text-sm"
                    onClick={handleRegeneratePrompt}
                    disabled={promptGeneration.isGenerating}
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="card border-[#3a3a3e]">
                <div className="p-4">
                  <pre className="mb-0 text-sm whitespace-pre-wrap max-h-[300px] overflow-auto text-[#a1a1aa]">
                    {promptGeneration.generatedPrompt}
                  </pre>
                </div>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-lg mt-3 flex items-start gap-2">
                <HelpCircle size={14} className="text-blue-400 mt-0.5" />
                <span className="text-blue-400 text-sm">
                  Copy this prompt and paste it into your preferred AI tool (ChatGPT, Claude, etc.)
                  to get assistance with your question.
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {promptGeneration.isGenerating ? (
                <div>
                  <Loader2 size={24} className="text-blue-400 mb-2 mx-auto animate-spin" />
                  <div className="text-sm text-[#6b6b70]">Generating AI prompt...</div>
                </div>
              ) : (
                <div className="text-[#6b6b70]">
                  <Zap size={32} className="mb-2 mx-auto opacity-50" />
                  <div>Click "Generate Prompt" to create an AI prompt based on your question</div>
                </div>
              )}
            </div>
          )}

          {/* Usage Tips */}
          {!promptGeneration.generatedPrompt && !promptGeneration.isGenerating && (
            <div className="card border-amber-500/50">
              <div className="p-4">
                <h6 className="text-amber-400 font-semibold mb-2">How to use AI prompts:</h6>
                <ul className="text-sm text-[#a1a1aa] space-y-1 mb-0 list-disc list-inside">
                  <li>Copy the generated prompt to your clipboard</li>
                  <li>Open your preferred AI tool (ChatGPT, Claude, Gemini, etc.)</li>
                  <li>Paste the prompt and get instant assistance</li>
                  <li>Use the AI's suggestions to improve your question</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2a2a2e]">
          <div className="flex justify-between items-center">
            <div className="text-sm text-[#6b6b70] flex items-center">
              <Lightbulb size={14} className="mr-1" />
              AI prompts help you create better questions faster
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={handleClose}
              >
                <X size={14} className="mr-1" />
                Close
              </button>
              {!promptGeneration.generatedPrompt && (
                <button
                  className="btn-primary"
                  onClick={promptType === 'custom' ? handleGenerateCustomPrompt : handleRegeneratePrompt}
                  disabled={promptGeneration.isGenerating || (promptType === 'custom' && !customPrompt.trim())}
                >
                  {promptGeneration.isGenerating ? (
                    <>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={14} className="mr-1" />
                      Generate Prompt
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGenerationModal;
