import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Code, Loader2 } from 'lucide-react';
import MonacoErrorBoundary from './MonacoErrorBoundary';

// Lazy load Monaco Editor to avoid SSR issues
const Editor = React.lazy(() => import('@monaco-editor/react'));

interface SafeMonacoEditorProps {
  height?: string;
  language?: string;
  value?: string;
  onChange?: (value: string | undefined) => void;
  options?: any;
  onMount?: (editor: any, monaco: any) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const SafeMonacoEditor: React.FC<SafeMonacoEditorProps> = ({
  height = '400px',
  language = 'javascript',
  value = '',
  onChange,
  options = {},
  onMount,
  readOnly = false,
  placeholder = 'Write your code here...'
}) => {
  const [useTextarea, setUseTextarea] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editorHeight, setEditorHeight] = useState(height);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate actual height when using percentage
  useEffect(() => {
    if (height === '100%' && containerRef.current) {
      const updateHeight = () => {
        const container = containerRef.current;
        if (container) {
          const parentHeight = container.offsetParent?.clientHeight || container.parentElement?.clientHeight;
          if (parentHeight && parentHeight > 0) {
            // Subtract some padding/border space
            const calculatedHeight = Math.max(300, parentHeight - 10);
            setEditorHeight(`${calculatedHeight}px`);
          } else {
            // Fallback to a reasonable minimum
            setEditorHeight('400px');
          }
        }
      };

      // Initial calculation
      updateHeight();

      // Set up resize observer
      const resizeObserver = new ResizeObserver(updateHeight);
      if (containerRef.current?.parentElement) {
        resizeObserver.observe(containerRef.current.parentElement);
      }

      // Fallback with timeout
      const timeoutId = setTimeout(updateHeight, 100);

      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeoutId);
      };
    } else {
      setEditorHeight(height);
    }
  }, [height]);

  useEffect(() => {
    // Set a timeout to fallback to textarea if Monaco takes too long
    timeoutRef.current = window.setTimeout(() => {
      setLoadError('Editor is taking too long to load');
      setUseTextarea(true);
      setIsLoading(false);
    }, 10000); // 10 second timeout

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(null);

    try {
      // Force layout after mount
      setTimeout(() => {
        editor.layout();
      }, 100);

      onMount?.(editor, monaco);
    } catch (error) {
      console.warn('Monaco onMount error:', error);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    try {
      onChange?.(value);
    } catch (error) {
      console.warn('Monaco onChange error:', error);
    }
  };

  // Fallback to textarea
  if (useTextarea || loadError) {
    return (
      <div ref={containerRef}>
        {loadError && (
          <div className="mb-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-amber-400">{loadError} - Using text area fallback</span>
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
          style={{ height: editorHeight }}
          className="input w-full font-mono text-sm leading-relaxed resize-none"
        />
      </div>
    );
  }

  const defaultOptions = {
    fontSize: 14,
    fontFamily: 'monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: 'on',
    roundedSelection: false,
    padding: { top: 10 },
    automaticLayout: true,
    theme: 'vs-dark',
    readOnly,
    wordWrap: 'on',
    acceptSuggestionOnCommitCharacter: false,
    acceptSuggestionOnEnter: 'off',
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    parameterHints: { enabled: false },
    contextmenu: false,
    ...options
  };

  return (
    <MonacoErrorBoundary
      fallback={
        <div>
          <div className="mb-2 p-3 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <span className="text-amber-400">Code editor crashed - Using text area fallback</span>
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={readOnly}
            placeholder={placeholder}
            style={{ height: editorHeight }}
            className="input w-full font-mono text-sm leading-relaxed resize-none"
          />
        </div>
      }
    >
      <div className="relative" ref={containerRef} style={{ height: height }}>
        {isLoading && (
          <div
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#1a1a1e] border border-[#2a2a2e] rounded-lg z-10"
            style={{ height: editorHeight }}
          >
            <div className="text-center">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
              <div className="text-sm text-[#6b6b70]">Loading code editor...</div>
            </div>
          </div>
        )}

        <div className="border border-[#2a2a2e] rounded-lg overflow-hidden" style={{ height: editorHeight, width: '100%' }}>
          <Editor
            height={editorHeight}
            language={language}
            value={value}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={defaultOptions}
            loading={
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code size={24} className="text-[#6b6b70] mx-auto mb-2" />
                  <div className="text-sm text-[#6b6b70]">Initializing editor...</div>
                </div>
              </div>
            }
            beforeMount={(monaco) => {
              // Configure Monaco before mounting
              try {
                monaco.editor.defineTheme('custom-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [],
                  colors: {
                    'editor.background': '#141416'
                  }
                });
              } catch (error) {
                console.warn('Monaco theme setup error:', error);
              }
            }}
            onValidate={(markers) => {
              // Handle validation markers if needed
              if (markers.length > 0) {
                console.debug('Monaco validation markers:', markers);
              }
            }}
          />
        </div>
      </div>
    </MonacoErrorBoundary>
  );
};

export default SafeMonacoEditor;
