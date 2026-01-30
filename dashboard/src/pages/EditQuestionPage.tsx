// pages/EditQuestionPage.tsx - FIXED FOR EDIT MODE SUPPORT
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import QuestionCreationWizard from '../components/QuestionCreation/QuestionCreationWizard';
import { QuestionCreationProvider } from '../context/QuestionCreationContext';
import apiService from '../services/ApiService';
import type { Question } from '../types';

const EditQuestionPage: React.FC = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine the mode and data source
  const editQuestionFromState = location.state?.editQuestion;
  const duplicateData = location.state?.duplicateFrom;

  const isEditMode = !!questionId && !duplicateData;
  const isDuplicateMode = !!duplicateData;
  const mode = isEditMode ? 'edit' : isDuplicateMode ? 'duplicate' : 'create';

  useEffect(() => {
    if (editQuestionFromState) {
      // Use question data from navigation state (from ViewQuestionPage)
      setQuestion(editQuestionFromState);
      setLoading(false);
    } else if (duplicateData) {
      // We're duplicating a question
      setQuestion(duplicateData);
      setLoading(false);
    } else if (questionId) {
      // We're editing but don't have state data - fetch from API
      fetchQuestion();
    } else {
      // We're creating a new question
      setLoading(false);
    }
  }, [questionId, editQuestionFromState, duplicateData]);

  const fetchQuestion = async () => {
    if (!questionId) return;

    try {
      setLoading(true);
      setError(null);

      // FIXED: getQuestion returns Question directly, no wrapper
      const question = await apiService.getQuestion(questionId);

      if (!question || !question._id) {
        throw new Error('Failed to fetch question');
      }

      setQuestion(question);
    } catch (error: any) {
      console.error('Error fetching question:', error);
      setError(error.message || 'Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (questionId: string, _savedQuestion: Question) => {

    if (isEditMode) {
      // Navigate back to view page for edits
      navigate(`/admin/question-bank/view/${questionId}`, {
        state: { message: 'Question updated successfully' }
      });
    } else {
      // Navigate to question bank for new/duplicate questions
      navigate('/admin/question-bank', {
        state: {
          message: `Question ${isDuplicateMode ? 'duplicated' : 'created'} successfully`,
          highlightQuestionId: questionId
        }
      });
    }
  };

  const handleCancel = () => {
    if (isEditMode && question?._id) {
      // Go back to view page for edits
      navigate(`/admin/question-bank/view/${question._id}`);
    } else {
      // Go back to question bank
      navigate('/admin/question-bank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-3" />
            <p className="text-[#6b6b70]">
              {isEditMode ? 'Loading question for editing...' :
                isDuplicateMode ? 'Preparing question for duplication...' :
                  'Preparing form...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg text-center mb-4">
              <span className="text-red-400">
                <strong>Error:</strong> {error}
              </span>
            </div>
            <div className="text-center">
              <button className="btn-primary" onClick={() => navigate('/admin/question-bank')}>
                Back to Question Bank
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuestionCreationProvider
      initialQuestion={question || undefined}
      mode={mode}
    >
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Mode indicator */}
        {(isEditMode || isDuplicateMode) && question && (
          <div className={`p-4 ${isEditMode ? 'bg-blue-500/10 border-blue-500/25' : 'bg-[#2a2a2e] border-[#3a3a3e]'} border rounded-lg mb-4`}>
            <strong className={isEditMode ? 'text-blue-400' : 'text-[#a1a1aa]'}>
              {isEditMode ? 'Editing Question:' : 'Duplicating Question:'}
            </strong> <span className={isEditMode ? 'text-blue-400' : 'text-[#a1a1aa]'}>{question.title}</span>
            {isEditMode && (
              <div className="text-sm text-[#6b6b70] mt-1">
                All validation rules will be applied to ensure question integrity.
              </div>
            )}
            <div className="text-sm text-[#6b6b70] mt-2">
              <strong className="text-[#a1a1aa]">Details:</strong> {question.type} • {question.language}
              {question.category && ` • ${question.category}`} • {question.difficulty}
            </div>
          </div>
        )}

        <QuestionCreationWizard
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </QuestionCreationProvider>
  );
};

export default EditQuestionPage;
