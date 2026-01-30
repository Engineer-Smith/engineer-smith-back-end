// src/components/admin/dashboard/QuickActions.tsx
import React from 'react';
import { Users, BookOpen, FileText, Building, Code, Book } from 'lucide-react';
import type { QuickActionsProps } from '../../../types';

const QuickActions: React.FC<QuickActionsProps> = ({
  onAction,
  userRole,
  isSuperOrgAdmin,
  className,
  ...props
}) => (
  <div className={`card p-6 ${className || ''}`} {...props}>
    <h5 className="font-mono text-lg font-semibold mb-4">Quick Actions</h5>
    <div className="flex flex-wrap gap-2">
      {(userRole === 'admin' || userRole === 'instructor') && (
        <button
          className="btn-primary text-sm flex items-center gap-2"
          onClick={() => onAction('addUser')}
        >
          <Users className="w-4 h-4" />
          Add New User
        </button>
      )}
      <button
        className="px-3 py-1.5 rounded text-sm font-medium bg-green-500 hover:bg-green-600 text-white transition-colors flex items-center gap-2"
        onClick={() => onAction('createQuestion')}
      >
        <BookOpen className="w-4 h-4" />
        Create Question
      </button>
      <button
        className="px-3 py-1.5 rounded text-sm font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex items-center gap-2"
        onClick={() => onAction('createTest')}
      >
        <FileText className="w-4 h-4" />
        Create Test
      </button>
      {userRole === 'admin' && (
        <>
          <button
            className="px-3 py-1.5 rounded text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-2"
            onClick={() => onAction('createCodeChallenge')}
          >
            <Code className="w-4 h-4" />
            Create Challenge
          </button>
          <button
            className="btn-secondary text-sm flex items-center gap-2"
            onClick={() => onAction('createTrack')}
          >
            <Book className="w-4 h-4" />
            Create Track
          </button>
        </>
      )}
      {isSuperOrgAdmin && userRole === 'admin' && (
        <button
          className="btn-danger text-sm flex items-center gap-2"
          onClick={() => onAction('addOrganization')}
        >
          <Building className="w-4 h-4" />
          Add Organization
        </button>
      )}
    </div>
  </div>
);

export default QuickActions;
