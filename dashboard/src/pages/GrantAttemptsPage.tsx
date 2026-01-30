import {
  AlertCircle,
  Award,
  CheckCircle,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  User as UserIcon,
  Users,
  Loader2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import type { UserListItem } from '../types';
import type { Test } from '../types/test';

// Local type for API response
interface OverrideResponse {
  _id: string;
  userId: string;
  testId: string;
  organizationId: string;
  extraAttempts: number;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
  };
  test?: {
    _id: string;
    title: string;
  };
  granter?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

interface StudentWithAttempts extends UserListItem {
  unlimitedAttempts?: boolean;
  testAttempts?: Array<{
    testId: string;
    testTitle: string;
    totalAttempts: number | 'unlimited';
    usedAttempts: number;
    remainingAttempts: number | 'unlimited';
    unlimited?: boolean;
    hasOverride: boolean;
    overrideAttempts?: number;
  }>;
}

export default function GrantAttemptsPage() {
  const { grantAttemptsDirectly, loading, error } = useNotifications();

  // State management
  const [students, setStudents] = useState<StudentWithAttempts[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [overrides, setOverrides] = useState<OverrideResponse[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithAttempts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantForm, setGrantForm] = useState({
    testId: '',
    extraAttempts: 1,
    reason: ''
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showRefreshSpinner = false) => {
    try {
      if (showRefreshSpinner) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [dashboardData, testsData, overridesData] = await Promise.all([
        ApiService.getUserDashboard({ role: 'student', limit: 100 }),
        ApiService.getAllTests(),
        ApiService.getStudentOverrides()
      ]);

      const studentUsers = dashboardData.users.list;
      setStudents(studentUsers);
      setTests(testsData as Test[]);
      setOverrides(overridesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Handle student selection
  const handleSelectStudent = async (student: StudentWithAttempts) => {
    setSelectedStudent(student);

    try {
      const testAttempts = await Promise.all(
        tests.map(async (test) => {
          try {
            const status = await ApiService.getAttemptStatus(test._id, student._id);
            const attempts = status.attempts as any; // Backend may return unlimited field
            return {
              testId: test._id,
              testTitle: test.title,
              totalAttempts: attempts.total,
              usedAttempts: attempts.used,
              remainingAttempts: attempts.remaining,
              unlimited: attempts.unlimited || false,
              hasOverride: !!status.override,
              overrideAttempts: status.override?.extraAttempts
            };
          } catch (error) {
            return {
              testId: test._id,
              testTitle: test.title,
              totalAttempts: 0,
              usedAttempts: 0,
              remainingAttempts: 0,
              unlimited: false,
              hasOverride: false
            };
          }
        })
      );

      setSelectedStudent({
        ...student,
        unlimitedAttempts: (student as any).unlimitedAttempts,
        testAttempts
      });
    } catch (error) {
      console.error('Error loading student test data:', error);
    }
  };

  // Handle grant attempts
  const handleGrantAttempts = async () => {
    if (!selectedStudent || !grantForm.testId || !grantForm.reason.trim()) {
      alert('Please select a test and provide a reason');
      return;
    }

    try {
      await grantAttemptsDirectly({
        userId: selectedStudent._id,
        testId: grantForm.testId,
        extraAttempts: grantForm.extraAttempts,
        reason: grantForm.reason
      });

      setGrantForm({ testId: '', extraAttempts: 1, reason: '' });
      setShowGrantModal(false);
      await loadData(true);

      if (selectedStudent) {
        await handleSelectStudent(selectedStudent);
      }
    } catch (error) {
      console.error('Error granting attempts:', error);
    }
  };

  // Handle override deletion
  const handleDeleteOverride = async (overrideId: string) => {
    if (!window.confirm('Are you sure you want to delete this override?')) return;

    try {
      await ApiService.deleteStudentOverride(overrideId);
      await loadData(true);

      if (selectedStudent) {
        await handleSelectStudent(selectedStudent);
      }
    } catch (error) {
      console.error('Error deleting override:', error);
    }
  };

  // Helper function to get user's display name
  const getUserDisplayName = (user: any) => {
    if (user.fullName) {
      return user.fullName;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.loginId || user.email || user._id || 'Unknown User';
  };

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const displayName = getUserDisplayName(student);
    return (
      displayName.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.loginId?.toLowerCase().includes(searchLower)
    );
  });

  // Get student's overrides
  const getStudentOverrides = (studentId: string) => {
    return overrides.filter(override => override.userId === studentId);
  };

  if (isLoading) {
    return (
      <div className="container-section py-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
          <p className="text-[#a1a1aa]">Loading students and test data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-section py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="font-mono text-2xl font-bold flex items-center gap-2 mb-1">
            <Award size={28} className="text-amber-500" />
            Grant Test Attempts
          </h2>
          <p className="text-[#a1a1aa]">Select a student to view and manage their test attempts</p>
        </div>
        <button
          className="btn-secondary"
          onClick={() => loadData(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/25 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ minHeight: 'calc(100vh - 250px)' }}>
        {/* Left Panel - Student List */}
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            <div className="p-4 border-b border-[#2a2a2e]">
              <h6 className="font-semibold text-[#f5f5f4]">Students ({filteredStudents.length})</h6>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-[#2a2a2e]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70]" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9 w-full"
                />
              </div>
            </div>

            {/* Student List */}
            <div className="flex-1 overflow-y-auto">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={48} className="text-[#6b6b70] mx-auto mb-3" />
                  <p className="text-[#6b6b70]">No students found</p>
                </div>
              ) : (
                <div>
                  {filteredStudents.map(student => {
                    const studentOverrides = getStudentOverrides(student._id);
                    const isSelected = selectedStudent?._id === student._id;

                    return (
                      <div
                        key={student._id}
                        onClick={() => handleSelectStudent(student)}
                        className={`p-3 border-b border-[#2a2a2e] cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-500/10 border-r-4 border-r-blue-500'
                            : 'hover:bg-[#1a1a1e]'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold text-[#f5f5f4]">
                              {getUserDisplayName(student)}
                            </div>
                            <div className="text-sm text-[#6b6b70]">{student.email || student.loginId || 'No email'}</div>
                            {studentOverrides.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Award size={12} className="text-amber-400" />
                                <span className="badge-amber text-xs">
                                  {studentOverrides.length} override{studentOverrides.length !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <CheckCircle size={20} className="text-blue-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Student Details */}
        <div className="lg:col-span-2">
          {!selectedStudent ? (
            <div className="card h-full flex items-center justify-center">
              <div className="text-center p-8">
                <UserIcon size={64} className="text-[#6b6b70] mx-auto mb-4" />
                <h4 className="text-[#a1a1aa] font-semibold mb-2">Select a Student</h4>
                <p className="text-[#6b6b70]">Choose a student from the left panel to view and manage their test attempts</p>
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col">
              <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-semibold text-[#f5f5f4]">{getUserDisplayName(selectedStudent)}</h5>
                    {selectedStudent.unlimitedAttempts && (
                      <span className="badge-blue text-xs flex items-center gap-1">
                        <Award size={10} />
                        Demo - Unlimited
                      </span>
                    )}
                  </div>
                  <small className="text-[#6b6b70]">{selectedStudent.email || selectedStudent.loginId || 'No contact info'}</small>
                </div>
                <button
                  className="btn-primary"
                  onClick={() => setShowGrantModal(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Grant Attempts
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-[#1a1a1e] rounded-lg text-center">
                    <h4 className="text-2xl font-bold text-[#f5f5f4]">{selectedStudent.testAttempts?.length || 0}</h4>
                    <small className="text-[#6b6b70]">Available Tests</small>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                    <h4 className="text-2xl font-bold text-amber-400">{getStudentOverrides(selectedStudent._id).length}</h4>
                    <small className="text-[#6b6b70]">Active Overrides</small>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg text-center">
                    <h4 className="text-2xl font-bold text-green-400">
                      {selectedStudent.unlimitedAttempts ? '∞' : selectedStudent.testAttempts?.reduce((sum, test) => {
                        if (test.unlimited) return sum;
                        return sum + (typeof test.remainingAttempts === 'number' ? test.remainingAttempts : 0);
                      }, 0) || 0}
                    </h4>
                    <small className="text-[#6b6b70]">Total Remaining</small>
                  </div>
                </div>

                {/* Test Attempts */}
                <h6 className="font-semibold text-[#f5f5f4] mb-3">Test Attempts</h6>
                {!selectedStudent.testAttempts || selectedStudent.testAttempts.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText size={48} className="text-[#6b6b70] mx-auto mb-3" />
                    <p className="text-[#6b6b70]">No test data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedStudent.testAttempts.map(testAttempt => {
                      const isUnlimited = testAttempt.unlimited || selectedStudent.unlimitedAttempts || testAttempt.totalAttempts === 'unlimited' || testAttempt.remainingAttempts === 'unlimited';
                      return (
                        <div key={testAttempt.testId} className="p-4 border border-[#2a2a2e] rounded-lg bg-[#1a1a1e]">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <h6 className="font-semibold text-[#f5f5f4]">{testAttempt.testTitle}</h6>
                                {isUnlimited && (
                                  <span className="badge-green text-xs">Unlimited</span>
                                )}
                              </div>

                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <div className="text-xs text-[#6b6b70]">Total</div>
                                  <div className="font-semibold text-[#f5f5f4]">
                                    {isUnlimited ? '∞' : testAttempt.totalAttempts}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-[#6b6b70]">Used</div>
                                  <div className="font-semibold text-[#f5f5f4]">{testAttempt.usedAttempts}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-[#6b6b70]">Remaining</div>
                                  <div className={`font-semibold ${
                                    isUnlimited || (typeof testAttempt.remainingAttempts === 'number' && testAttempt.remainingAttempts > 0) ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                    {isUnlimited ? '∞' : testAttempt.remainingAttempts}
                                  </div>
                                </div>
                                <div>
                                  {testAttempt.hasOverride && (
                                    <span className="badge-amber flex items-center gap-1">
                                      <Award size={12} />
                                      +{testAttempt.overrideAttempts}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {testAttempt.hasOverride && (
                              <button
                                className="btn-ghost text-red-400 p-2"
                                onClick={() => {
                                  const override = getStudentOverrides(selectedStudent._id)
                                    .find(o => o.testId === testAttempt.testId);
                                  if (override) {
                                    handleDeleteOverride(override._id);
                                  }
                                }}
                                title="Remove override"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grant Modal */}
      {showGrantModal && (
        <div className="modal-backdrop" onClick={() => setShowGrantModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
              <h5 className="font-semibold text-[#f5f5f4]">
                Grant Attempts to {selectedStudent ? getUserDisplayName(selectedStudent) : 'Student'}
              </h5>
              <button
                className="text-[#6b6b70] hover:text-[#f5f5f4]"
                onClick={() => setShowGrantModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Select Test *</label>
                <select
                  value={grantForm.testId}
                  onChange={(e) => setGrantForm({ ...grantForm, testId: e.target.value })}
                  className="select w-full"
                  required
                >
                  <option value="">Choose a test...</option>
                  {tests.map(test => (
                    <option key={test._id} value={test._id}>
                      {test.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Extra Attempts *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={grantForm.extraAttempts}
                  onChange={(e) => setGrantForm({ ...grantForm, extraAttempts: parseInt(e.target.value) || 1 })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-1">Reason *</label>
                <textarea
                  rows={3}
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                  placeholder="Explain why this student needs additional attempts..."
                  className="input w-full resize-none"
                  required
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-2">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowGrantModal(false);
                  setGrantForm({ testId: '', extraAttempts: 1, reason: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleGrantAttempts}
                disabled={loading}
              >
                {loading ? 'Granting...' : 'Grant Attempts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
