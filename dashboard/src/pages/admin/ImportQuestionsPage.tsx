// src/pages/admin/ImportQuestionsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  FileJson,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import apiService from '../../services/ApiService';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

export default function ImportQuestionsPage() {
  const navigate = useNavigate();

  const [jsonInput, setJsonInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateJSON = (input: string): { valid: boolean; questions: any[] | null; error?: string } => {
    if (!input.trim()) {
      return { valid: false, questions: null, error: 'Please enter JSON data' };
    }

    try {
      const parsed = JSON.parse(input);

      if (!Array.isArray(parsed)) {
        return { valid: false, questions: null, error: 'JSON must be an array of questions' };
      }

      if (parsed.length === 0) {
        return { valid: false, questions: null, error: 'Array must contain at least one question' };
      }

      // Basic validation of each question
      const errors: string[] = [];
      parsed.forEach((q, index) => {
        if (!q.title) errors.push(`Question ${index + 1}: missing title`);
        if (!q.type) errors.push(`Question ${index + 1}: missing type`);
        if (!q.language) errors.push(`Question ${index + 1}: missing language`);
        if (!q.difficulty) errors.push(`Question ${index + 1}: missing difficulty`);
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
      } else {
        setValidationErrors([]);
      }

      return { valid: true, questions: parsed };
    } catch (e) {
      return { valid: false, questions: null, error: 'Invalid JSON format' };
    }
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);

    const validation = validateJSON(jsonInput);
    if (!validation.valid || !validation.questions) {
      setError(validation.error || 'Invalid input');
      return;
    }

    try {
      setImporting(true);
      const importResult = await apiService.importQuestions(validation.questions);
      setResult(importResult);
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.response?.data?.message || 'Failed to import questions');
    } finally {
      setImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonInput(content);
      setError(null);
      setResult(null);
      setValidationErrors([]);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(file);
  };

  const exampleJSON = `[
  {
    "title": "What is the output of console.log(typeof null)?",
    "description": "JavaScript type checking question",
    "type": "multipleChoice",
    "language": "javascript",
    "difficulty": "easy",
    "category": "syntax",
    "options": ["null", "undefined", "object", "string"],
    "correctAnswer": 2,
    "tags": ["javascript", "types"]
  },
  {
    "title": "Is JavaScript a statically typed language?",
    "description": "Understanding JavaScript's type system",
    "type": "trueFalse",
    "language": "javascript",
    "difficulty": "easy",
    "correctAnswer": false
  }
]`;

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/question-bank')}
            className="flex items-center gap-2 text-[#6b6b70] hover:text-[#f5f5f4] transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            Back to Question Bank
          </button>

          <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
            Import Questions
          </h1>
          <p className="text-[#a1a1aa]">
            Bulk import questions from JSON format
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            result.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-amber-500/10 border border-amber-500/20'
          }`}>
            <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${result.success ? 'text-green-400' : 'text-amber-400'}`} />
            <div>
              <p className={result.success ? 'text-green-400' : 'text-amber-400'}>
                Import complete: {result.imported} imported, {result.failed} failed
              </p>
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 text-sm text-[#a1a1aa] list-disc list-inside">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>...and {result.errors.length - 5} more errors</li>
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
              <h2 className="font-mono font-semibold flex items-center gap-2">
                <FileJson size={18} />
                JSON Input
              </h2>
              <label className="btn-secondary text-sm cursor-pointer flex items-center gap-2">
                <Upload size={14} />
                Upload File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-4">
              <textarea
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setError(null);
                  setResult(null);
                  validateJSON(e.target.value);
                }}
                className="input w-full h-80 font-mono text-sm resize-none"
                placeholder="Paste your JSON array of questions here..."
              />

              {validationErrors.length > 0 && (
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-sm font-medium text-amber-400 mb-2">Validation warnings:</p>
                  <ul className="text-xs text-[#a1a1aa] space-y-1">
                    {validationErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>...and {validationErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleImport}
                  disabled={importing || !jsonInput.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import Questions
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setJsonInput('');
                    setError(null);
                    setResult(null);
                    setValidationErrors([]);
                  }}
                  className="btn-secondary"
                  disabled={importing}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Example Section */}
          <div className="card">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h2 className="font-mono font-semibold">Example Format</h2>
            </div>

            <div className="p-4">
              <pre className="bg-[#0a0a0b] p-4 rounded-lg overflow-x-auto text-xs font-mono text-[#a1a1aa]">
                {exampleJSON}
              </pre>

              <button
                onClick={() => setJsonInput(exampleJSON)}
                className="btn-secondary w-full mt-4"
              >
                Use Example
              </button>

              <div className="mt-6 space-y-4">
                <h3 className="font-medium text-[#f5f5f4]">Supported Question Types</h3>
                <ul className="text-sm text-[#a1a1aa] space-y-2">
                  <li><code className="text-blue-400">multipleChoice</code> - Multiple choice questions</li>
                  <li><code className="text-blue-400">trueFalse</code> - True/False questions</li>
                  <li><code className="text-blue-400">codeChallenge</code> - Code challenges with tests</li>
                  <li><code className="text-blue-400">codeDebugging</code> - Debug broken code</li>
                  <li><code className="text-blue-400">fillInTheBlank</code> - Fill in the blank</li>
                  <li><code className="text-blue-400">dragDropCloze</code> - Drag and drop cloze</li>
                </ul>

                <h3 className="font-medium text-[#f5f5f4]">Required Fields</h3>
                <ul className="text-sm text-[#a1a1aa] space-y-1">
                  <li><code className="text-green-400">title</code> - Question title</li>
                  <li><code className="text-green-400">type</code> - Question type</li>
                  <li><code className="text-green-400">language</code> - Programming language</li>
                  <li><code className="text-green-400">difficulty</code> - easy, medium, or hard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
