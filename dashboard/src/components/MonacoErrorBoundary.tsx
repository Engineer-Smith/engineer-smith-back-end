import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component, Suspense } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MonacoErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Monaco Editor Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-[#2a2a2e] rounded-lg h-[400px]">
          <div className="h-full p-4 bg-amber-500/10 border border-amber-500/25 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle size={24} className="text-amber-400 mx-auto mb-2" />
              <div className="text-[#f5f5f4]">Code editor failed to load</div>
              <small className="text-[#6b6b70]">
                Please refresh the page or use a text area fallback
              </small>
              <div className="mt-3">
                <button
                  className="px-3 py-1.5 text-sm border border-amber-500/50 text-amber-400 rounded hover:bg-amber-500/10 transition-colors"
                  onClick={() => this.setState({ hasError: false })}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="p-4 border border-[#2a2a2e] rounded-lg h-[400px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
            <div className="text-[#a1a1aa]">Loading code editor...</div>
          </div>
        </div>
      }>
        {this.props.children}
      </Suspense>
    );
  }
}

export default MonacoErrorBoundary;
