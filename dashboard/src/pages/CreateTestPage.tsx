// Fixed CreateTestPage.tsx with proper navigation - Tailwind CSS
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTestWizard from '../components/tests/CreateTestWizard';

const CreateTestPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate('/admin/tests');
  };

  const handleComplete = () => {
    // Navigate back to test management with success message
    navigate('/admin/tests', {
      state: {
        message: 'Test created successfully!'
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <CreateTestWizard 
        onCancel={handleCancel}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default CreateTestPage;