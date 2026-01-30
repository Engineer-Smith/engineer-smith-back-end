// src/pages/PendingRequests.tsx - Enhanced with slide-out student details panel

import {
  ArrowLeft,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  User,
  X,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import ApiService from '../services/ApiService';
import type {
  UserDetailsDashboard,
  User as UserType
} from '../types';
import type {
  AttemptRequest,
  ReviewAttemptRequestData
} from '../types/notifications';

const PendingRequests: React.FC = () => {
  const { user } = useAuth();
  const { reviewAttemptRequest } = useNotifications();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<AttemptRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AttemptRequest | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approved' | 'rejected'>('approved');
  const [submitting, setSubmitting] = useState(false);

  // Student details panel state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDashboard, setStudentDashboard] = useState<UserDetailsDashboard | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const typedUser = user as UserType | null;

  // Fetch pending requests
  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const pendingRequests = await ApiService.getPendingAttemptRequests();
      setRequests(pendingRequests);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch pending requests');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student dashboard data
  const fetchStudentDetails = async (studentId: string) => {
    try {
      setStudentLoading(true);
      setStudentError(null);
      const dashboardData = await ApiService.getUserDetailsDashboard(studentId);
      setStudentDashboard(dashboardData);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setStudentError(err instanceof Error ? err.message : 'Failed to fetch student details');
    } finally {
      setStudentLoading(false);
    }
  };

  // Handle student selection
  const handleStudentSelect = (studentId: string) => {
    if (selectedStudentId === studentId) {
      setSelectedStudentId(null);
      setStudentDashboard(null);
    } else {
      setSelectedStudentId(studentId);
      fetchStudentDetails(studentId);
    }
  };

  useEffect(() => {
    if (typedUser && (typedUser.role === 'admin' || typedUser.role === 'instructor')) {
      fetchPendingRequests();
    } else {
      navigate('/dashboard');
    }
  }, [typedUser, navigate]);

  // Handle review modal
  const openReviewModal = (request: AttemptRequest, decision: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setReviewDecision(decision);
    setReviewNotes('');
    setReviewModal(true);
  };

  const closeReviewModal = () => {
    setReviewModal(false);
    setSelectedRequest(null);
    setReviewNotes('');
  };

  const handleSubmitReview = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);

      const reviewData: ReviewAttemptRequestData = {
        requestId: selectedRequest._id,
        decision: reviewDecision,
        reviewNotes: reviewNotes.trim() || undefined
      };

      await reviewAttemptRequest(reviewData);
      setRequests(prev => prev.filter(r => r._id !== selectedRequest._id));
      closeReviewModal();
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeClass = (role: string): string => {
    switch (role) {
      case 'admin': return 'badge-red';
      case 'instructor': return 'badge-amber';
      case 'student': return 'badge-blue';
      default: return 'badge-gray';
    }
  };

  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-20">
        <div className="container-section py-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-[#a1a1aa]">Loading pending requests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] pt-20">
        <div className="container-section py-12">
          <div className="max-w-xl mx-auto">
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertCircle size={20} className="text-red-400" />
                <h5 className="font-semibold text-red-400">Error Loading Requests</h5>
              </div>
              <p className="text-[#a1a1aa] mb-4">{error}</p>
              <div className="flex justify-center gap-2">
                <button className="btn-primary" onClick={fetchPendingRequests}>
                  <RefreshCw size={16} className="mr-2" />
                  Retry
                </button>
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-20">
      <div className="container-section py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className={selectedStudentId ? 'lg:col-span-7' : 'lg:col-span-12'}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-1">Pending Attempt Requests</h2>
                <p className="text-[#a1a1aa]">
                  Review and approve student requests for additional test attempts
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary"
                  onClick={fetchPendingRequests}
                  disabled={loading}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Refresh
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="card p-4 text-center">
                <Clock size={32} className="text-amber-400 mx-auto mb-2" />
                <h4 className="text-2xl font-bold text-[#f5f5f4]">{requests.length}</h4>
                <small className="text-[#6b6b70]">Pending Requests</small>
              </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
                <h5 className="font-semibold text-[#f5f5f4] mb-2">No Pending Requests</h5>
                <p className="text-[#6b6b70]">All attempt requests have been reviewed.</p>
              </div>
            ) : (
              <div className="card">
                <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
                  <h5 className="font-semibold text-[#f5f5f4] flex items-center gap-2">
                    <Clock size={20} />
                    Requests Awaiting Review
                  </h5>
                  {selectedStudentId && (
                    <span className="badge-blue">
                      Student details panel open →
                    </span>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1a1e] border-b border-[#2a2a2e]">
                      <tr>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Student</th>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Test</th>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Requested</th>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Reason</th>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Submitted</th>
                        <th className="text-left p-4 text-[#a1a1aa] text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((request) => (
                        <tr
                          key={request._id}
                          className={`border-b border-[#2a2a2e] hover:bg-[#1a1a1e] transition-colors ${
                            selectedStudentId === request.user?._id ? 'bg-blue-500/5' : ''
                          }`}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <User size={16} className="text-white" />
                              </div>
                              <div>
                                <button
                                  className="text-left font-medium text-[#f5f5f4] hover:text-blue-400 flex items-center gap-1"
                                  onClick={() => handleStudentSelect(request.user?._id || request.userId)}
                                >
                                  {request.user?.fullName || `${request.user?.firstName} ${request.user?.lastName}`}
                                  <ChevronRight size={14} />
                                </button>
                                <small className="text-[#6b6b70]">{request.user?.email}</small>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-cyan-400" />
                              <div>
                                <div className="font-medium text-[#f5f5f4]">{request.test?.title}</div>
                                {request.test?.description && (
                                  <small className="text-[#6b6b70]">{request.test.description}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="badge-amber">
                              {request.requestedAttempts} attempt{request.requestedAttempts !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="p-4" style={{ maxWidth: '200px' }}>
                            <small className="text-[#6b6b70]">
                              {request.reason.length > 50
                                ? `${request.reason.substring(0, 50)}...`
                                : request.reason
                              }
                            </small>
                          </td>
                          <td className="p-4">
                            <small className="text-[#6b6b70]">
                              {formatDate(request.createdAt)}
                            </small>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <button
                                className="btn-primary text-sm py-1 px-2"
                                onClick={() => openReviewModal(request, 'approved')}
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Approve
                              </button>
                              <button
                                className="btn-ghost text-red-400 text-sm py-1 px-2 border border-red-400/30 rounded"
                                onClick={() => openReviewModal(request, 'rejected')}
                              >
                                <XCircle size={14} className="mr-1" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Student Details Side Panel */}
          {selectedStudentId && (
            <div className="lg:col-span-5">
              <div className="card sticky top-24">
                <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
                  <h6 className="font-semibold text-[#f5f5f4]">Student Details</h6>
                  <button
                    className="text-[#6b6b70] hover:text-[#f5f5f4]"
                    onClick={() => {
                      setSelectedStudentId(null);
                      setStudentDashboard(null);
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                  {studentLoading && (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
                      <p className="text-[#a1a1aa]">Loading student details...</p>
                    </div>
                  )}

                  {studentError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-lg">
                      <span className="text-red-400">{studentError}</span>
                    </div>
                  )}

                  {studentDashboard && (
                    <div>
                      {/* Student Profile */}
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3">
                          <User size={24} className="text-white" />
                        </div>
                        <h5 className="font-semibold text-[#f5f5f4] mb-1">{studentDashboard.user.fullName}</h5>
                        <span className={getRoleBadgeClass(studentDashboard.user.role)}>
                          {studentDashboard.user.role.charAt(0).toUpperCase() + studentDashboard.user.role.slice(1)}
                        </span>
                      </div>

                      {/* Basic Info */}
                      <div className="mb-6 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-[#6b6b70]" />
                          <span className="text-[#a1a1aa]">{studentDashboard.user.email || studentDashboard.user.loginId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Building size={14} className="text-[#6b6b70]" />
                          <span className="text-[#a1a1aa]">{studentDashboard.user.organization.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={14} className="text-[#6b6b70]" />
                          <span className="text-[#a1a1aa]">Member since {new Date(studentDashboard.user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Performance Overview */}
                      <div className="mb-6">
                        <h6 className="font-semibold text-[#f5f5f4] mb-3">Performance Overview</h6>
                        <div className="grid grid-cols-2 gap-4 text-center mb-4">
                          <div>
                            <h5 className="text-xl font-bold text-[#f5f5f4]">{studentDashboard.performance.overview.completedTests}</h5>
                            <small className="text-[#6b6b70]">Completed Tests</small>
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-[#f5f5f4]">{studentDashboard.performance.overview.averageScore.toFixed(1)}%</h5>
                            <small className="text-[#6b6b70]">Average Score</small>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <small className="text-[#6b6b70]">Pass Rate</small>
                              <small className="font-semibold text-[#f5f5f4]">{studentDashboard.performance.overview.passRate}%</small>
                            </div>
                            <div className="progress-bar">
                              <div
                                className={`progress-fill ${getPerformanceColor(studentDashboard.performance.overview.passRate)}`}
                                style={{ width: `${studentDashboard.performance.overview.passRate}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <small className="text-[#6b6b70]">Recent Trend</small>
                              <div className="flex items-center gap-1">
                                {studentDashboard.performance.trends.isImproving ? (
                                  <TrendingUp size={14} className="text-green-400" />
                                ) : (
                                  <TrendingUp size={14} className="text-red-400 rotate-180" />
                                )}
                                <small className="font-semibold text-[#f5f5f4]">
                                  {Math.abs(studentDashboard.performance.trends.scoreChange).toFixed(1)}% change
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h6 className="font-semibold text-[#f5f5f4] mb-3">Recent Test Activity</h6>
                        {studentDashboard.activity.recent.length === 0 ? (
                          <p className="text-[#6b6b70]">No recent test activity</p>
                        ) : (
                          <div className="space-y-3">
                            {studentDashboard.activity.recent.slice(0, 5).map((test, index) => (
                              <div key={index} className="p-3 border border-[#2a2a2e] rounded-lg bg-[#1a1a1e]">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-[#f5f5f4]">{test.testTitle}</div>
                                    <small className="text-[#6b6b70]">Attempt #{test.attemptNumber}</small>
                                  </div>
                                  <div className="text-right">
                                    <span className={test.score.passed ? 'badge-green' : 'badge-red'}>
                                      {test.score.percentage.toFixed(1)}%
                                    </span>
                                    <div>
                                      <small className="text-[#6b6b70]">
                                        {test.completedAt ? new Date(test.completedAt).toLocaleDateString() : 'In Progress'}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal */}
        {reviewModal && selectedRequest && (
          <div className="modal-backdrop" onClick={closeReviewModal}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-[#2a2a2e] flex justify-between items-center">
                <h5 className="font-semibold text-[#f5f5f4]">
                  {reviewDecision === 'approved' ? 'Approve' : 'Reject'} Attempt Request
                </h5>
                <button
                  className="text-[#6b6b70] hover:text-[#f5f5f4]"
                  onClick={closeReviewModal}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="p-4 bg-[#1a1a1e] rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <strong className="text-[#f5f5f4]">Student:</strong> <span className="text-[#a1a1aa]">{selectedRequest.user?.fullName}</span><br />
                      <strong className="text-[#f5f5f4]">Email:</strong> <span className="text-[#a1a1aa]">{selectedRequest.user?.email}</span><br />
                      <strong className="text-[#f5f5f4]">Test:</strong> <span className="text-[#a1a1aa]">{selectedRequest.test?.title}</span>
                    </div>
                    <div>
                      <strong className="text-[#f5f5f4]">Requested Attempts:</strong> <span className="text-[#a1a1aa]">{selectedRequest.requestedAttempts}</span><br />
                      <strong className="text-[#f5f5f4]">Submitted:</strong> <span className="text-[#a1a1aa]">{formatDate(selectedRequest.createdAt)}</span><br />
                      <strong className="text-[#f5f5f4]">Request ID:</strong> <span className="text-[#a1a1aa]">{selectedRequest._id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <strong className="text-[#f5f5f4]">Reason:</strong>
                    <div className="mt-2 p-3 bg-[#141416] border border-[#2a2a2e] rounded-lg text-[#a1a1aa]">
                      {selectedRequest.reason}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#a1a1aa] mb-2 flex items-center gap-1">
                    <MessageSquare size={16} />
                    Review Notes {reviewDecision === 'rejected' && <span className="text-red-400">*</span>}
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={
                      reviewDecision === 'approved'
                        ? "Optional: Add any notes about this approval..."
                        : "Required: Please explain why this request is being rejected..."
                    }
                    rows={3}
                    className="input w-full resize-none"
                    required={reviewDecision === 'rejected'}
                  />
                </div>
              </div>
              <div className="p-4 border-t border-[#2a2a2e] flex justify-end gap-2">
                <button className="btn-secondary" onClick={closeReviewModal} disabled={submitting}>
                  Cancel
                </button>
                <button
                  className={reviewDecision === 'approved' ? 'btn-primary' : 'btn-danger'}
                  onClick={handleSubmitReview}
                  disabled={submitting || (reviewDecision === 'rejected' && reviewNotes.trim() === '')}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {reviewDecision === 'approved' ? (
                        <CheckCircle size={16} className="mr-2" />
                      ) : (
                        <XCircle size={16} className="mr-2" />
                      )}
                      {reviewDecision === 'approved' ? 'Approve Request' : 'Reject Request'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
