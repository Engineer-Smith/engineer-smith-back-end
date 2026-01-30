// src/components/QuestionFormComponent.tsx - UPDATED WITH EDIT SUPPORT
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuestionCreationProvider } from '../context/QuestionCreationContext';
import type { Question } from '../types';
import QuestionCreationWizard from './QuestionCreation/QuestionCreationWizard';

interface QuestionFormComponentProps {
    question?: Partial<Question>;
    onSubmitSuccess?: (question: Question) => void;
    submitLabel?: string;
    showSubmitButton?: boolean;
    compact?: boolean;
    onCancel?: () => void;
}

const QuestionFormComponent: React.FC<QuestionFormComponentProps> = ({
    question: initialQuestion = {},
    onSubmitSuccess,
    onCancel,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get edit question data from navigation state
    const editQuestion = location.state?.editQuestion || location.state?.duplicateFrom;
    const isEditMode = !!editQuestion && !location.state?.duplicateFrom;
    const isDuplicateMode = !!location.state?.duplicateFrom;

    // Determine which question data to use and mode
    const questionData = editQuestion || initialQuestion;
    const mode = isEditMode ? 'edit' : isDuplicateMode ? 'duplicate' : 'create';

    const handleComplete = (questionId: string, question: Question) => {
        if (onSubmitSuccess) {
            onSubmitSuccess(question);
        } else {
            // Navigate appropriately based on mode
            if (isEditMode) {
                navigate(`/admin/question-bank/view/${questionId}`, {
                    state: { message: 'Question updated successfully' }
                });
            } else {
                navigate('/admin/question-bank', {
                    state: {
                        message: `Question ${isDuplicateMode ? 'duplicated' : 'created'} successfully`,
                        highlightQuestionId: questionId
                    }
                });
            }
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            // Navigate back appropriately
            if (isEditMode && questionData?._id) {
                navigate(`/admin/question-bank/view/${questionData._id}`);
            } else {
                navigate('/admin/question-bank');
            }
        }
    };

    return (
        <QuestionCreationProvider
            initialQuestion={questionData}
            mode={mode}
        >
            <div className="max-w-7xl mx-auto py-8 px-4">
                {/* Mode indicator */}
                {(isEditMode || isDuplicateMode) && (
                    <div className={`p-4 ${isEditMode ? 'bg-blue-500/10 border-blue-500/25' : 'bg-[#2a2a2e] border-[#3a3a3e]'} border rounded-lg mb-4`}>
                        <strong className={isEditMode ? 'text-blue-400' : 'text-[#a1a1aa]'}>
                            {isEditMode ? 'Editing Question:' : 'Duplicating Question:'}
                        </strong> <span className={isEditMode ? 'text-blue-400' : 'text-[#a1a1aa]'}>{questionData?.title}</span>
                        {isEditMode && (
                            <div className="text-sm text-[#6b6b70] mt-1">
                                All validation rules will be applied to ensure question integrity.
                            </div>
                        )}
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

export default QuestionFormComponent;
