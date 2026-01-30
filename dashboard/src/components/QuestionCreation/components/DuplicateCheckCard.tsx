import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Eye, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useQuestionCreation } from '../../../context/QuestionCreationContext';

const DuplicateCheckCard: React.FC = () => {
  const { state, checkForDuplicates, dispatch } = useQuestionCreation();
  const [duplicateCheckRun, setDuplicateCheckRun] = useState(false);
  const [isManualCheck, setIsManualCheck] = useState(false);

  const {
    questionData,
    duplicateChecking,
    duplicatesFound,
  } = state;

  // Auto-run duplicate check when component mounts
  useEffect(() => {
    if (!duplicateCheckRun && questionData.title && questionData.description) {
      setDuplicateCheckRun(true);
      checkForDuplicates();
    }
  }, [questionData.title, questionData.description, duplicateCheckRun, checkForDuplicates]);

  const handleRunDuplicateCheck = async () => {
    setDuplicateCheckRun(true);
    setIsManualCheck(true);

    try {
      const minLoadingTime = 1000;
      const startTime = Date.now();

      await checkForDuplicates();

      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
    } finally {
      setIsManualCheck(false);
    }
  };

  const handleReviewDuplicates = () => {
    dispatch({
      type: 'SET_DUPLICATES',
      payload: {
        duplicates: duplicatesFound,
        checkHash: state.lastDuplicateCheck
      }
    });
  };

  return (
    <div className="card mb-4 border-cyan-500/50">
      <div className="p-4">
        <h6 className="text-cyan-400 font-semibold mb-3">Duplicate Check</h6>

        {!duplicateCheckRun ? (
          <div className="text-center">
            <Search size={32} className="text-[#6b6b70] mb-2 mx-auto" />
            <p className="text-sm text-[#6b6b70] mb-3">Check for similar questions to avoid duplicates</p>
            <button
              className="btn-primary w-full bg-cyan-600 hover:bg-cyan-700 border-cyan-600"
              onClick={handleRunDuplicateCheck}
              disabled={!questionData.title || !questionData.description || duplicateChecking}
            >
              {duplicateChecking ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search size={14} className="mr-1" />
                  Check for Duplicates
                </>
              )}
            </button>
          </div>
        ) : duplicateChecking || isManualCheck ? (
          <div className="text-center">
            <Loader2 size={24} className="text-cyan-400 mb-2 mx-auto animate-spin" />
            <div className="text-sm text-[#6b6b70]">
              {isManualCheck ? 'Re-checking for duplicates...' : 'Searching for similar questions...'}
            </div>
          </div>
        ) : duplicatesFound.length > 0 ? (
          <div>
            <div className="flex items-center mb-2">
              <AlertTriangle size={16} className="text-amber-400 mr-2" />
              <span className="text-sm font-semibold text-amber-400">{duplicatesFound.length} Similar Questions Found</span>
            </div>
            <div className="text-sm text-[#6b6b70] mb-3">
              {duplicatesFound.filter(d => d.exactMatch).length > 0 && (
                <div className="text-red-400 mb-1">
                  <strong>{duplicatesFound.filter(d => d.exactMatch).length} exact match{duplicatesFound.filter(d => d.exactMatch).length > 1 ? 'es' : ''}</strong>
                </div>
              )}
              {duplicatesFound.filter(d => !d.exactMatch).length > 0 && (
                <div>
                  {duplicatesFound.filter(d => !d.exactMatch).length} similar questions
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button
                className="btn-primary w-full bg-amber-600 hover:bg-amber-700 border-amber-600"
                onClick={handleReviewDuplicates}
              >
                <Eye size={14} className="mr-1" />
                Review Duplicates
              </button>
              <button
                className="btn-secondary w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                onClick={handleRunDuplicateCheck}
                disabled={duplicateChecking || isManualCheck}
              >
                {duplicateChecking || isManualCheck ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} className="mr-1" />
                    Check Again
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle size={32} className="text-green-400 mb-2 mx-auto" />
            <div className="text-sm text-green-400 mb-2">No duplicates found!</div>
            <button
              className="btn-secondary border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              onClick={handleRunDuplicateCheck}
              disabled={duplicateChecking || isManualCheck}
            >
              {duplicateChecking || isManualCheck ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="mr-1" />
                  Check Again
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DuplicateCheckCard;
