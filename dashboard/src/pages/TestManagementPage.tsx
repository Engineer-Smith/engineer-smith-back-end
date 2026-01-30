// pages/TestManagementPage.tsx
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Archive,
  BarChart3,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Filter,
  Globe,
  Play,
  PlayCircle,
  Plus,
  Search,
  Target,
  Trash2,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/ApiService';
import type { Test, TestStatus } from '../types';

const TestManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isGlobalFilter, setIsGlobalFilter] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Handle success messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    fetchTests();
  }, [statusFilter, isGlobalFilter]);

  const fetchTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        limit: 50,
        skip: 0
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (isGlobalFilter !== 'all') {
        params.isGlobal = isGlobalFilter === 'true';
      }

      const tests = await apiService.getAllTests(params);

      if (!Array.isArray(tests)) {
        throw new Error('Failed to fetch tests');
      }

      setTests(tests);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      setError(error.message || 'Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateTest = () => navigate('/admin/tests/new');
  const handleViewTest = (testId: string) => navigate(`/admin/tests/view/${testId}`);
  const handleEditTest = (testId: string) => navigate(`/admin/tests/edit/${testId}`);
  const handlePreviewTest = (testId: string) => navigate(`/admin/tests/preview/${testId}`);

  const handleDeleteTest = (testId: string, testTitle: string) => {
    setTestToDelete({ id: testId, title: testTitle });
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!testToDelete) return;

    try {
      setDeleting(true);
      const response = await apiService.deleteTest(testToDelete.id);

      if (!response || !response.message) {
        throw new Error('Failed to delete test');
      }

      setDeleteModal(false);
      setTestToDelete(null);
      fetchTests();
    } catch (error: any) {
      alert('Error deleting test: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModal(false);
    setTestToDelete(null);
  };

  const handleStatusChange = async (testId: string, newStatus: TestStatus) => {
    try {
      const updatedTest = await apiService.updateTest(testId, { status: newStatus });

      if (!updatedTest || !updatedTest._id) {
        throw new Error('Failed to update test status');
      }

      fetchTests();
    } catch (error: any) {
      alert('Error updating test status: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'draft': return 'badge-amber';
      case 'archived': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3" />;
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'archived': return <Archive className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto" />
          <p className="text-[#a1a1aa]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Header */}
      <div className="bg-[#141416] border-b border-[#2a2a2e]">
        <div className="container-section py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h1 className="font-mono text-2xl font-bold">Test Management</h1>
                <p className="text-[#6b6b70] text-sm">
                  {user?.organization?.isSuperOrg
                    ? "Manage global and organization-specific tests"
                    : `Manage tests for ${user?.organization?.name}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.organization?.isSuperOrg && (
                <span className="badge-blue flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  Super Admin Access
                </span>
              )}
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleCreateTest}
              >
                <Plus className="w-4 h-4" />
                Create Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-section py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-400">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 bg-blue-500/5 border-blue-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-blue-400">{tests.length}</p>
                <p className="text-[#6b6b70] text-sm">Total Tests</p>
              </div>
            </div>
          </div>
          <div className="card p-5 bg-green-500/5 border-green-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Play className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-green-400">
                  {tests.filter(t => t.status === 'active').length}
                </p>
                <p className="text-[#6b6b70] text-sm">Active Tests</p>
              </div>
            </div>
          </div>
          <div className="card p-5 bg-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Edit className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-amber-400">
                  {tests.filter(t => t.status === 'draft').length}
                </p>
                <p className="text-[#6b6b70] text-sm">Draft Tests</p>
              </div>
            </div>
          </div>
          <div className="card p-5 bg-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-purple-400">
                  {tests.reduce((sum, test) => sum + (test.stats?.totalAttempts || 0), 0)}
                </p>
                <p className="text-[#6b6b70] text-sm">Total Attempts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select w-40"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            {user?.organization?.isSuperOrg && (
              <select
                value={isGlobalFilter}
                onChange={(e) => setIsGlobalFilter(e.target.value)}
                className="select w-40"
              >
                <option value="all">All Scope</option>
                <option value="true">Global</option>
                <option value="false">Organization</option>
              </select>
            )}
            <div className="flex items-center gap-2 text-[#6b6b70] text-sm">
              <Filter className="w-4 h-4" />
              {filteredTests.length} tests found
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card p-6 mb-6 border-red-500/30 bg-red-500/5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">Error: {error}</span>
            </div>
            <button className="btn-primary" onClick={fetchTests}>Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card p-12 text-center">
            <div className="spinner mb-4 mx-auto" />
            <p className="text-[#a1a1aa]">Loading tests...</p>
          </div>
        )}

        {/* Tests Grid */}
        {!loading && filteredTests.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTests.map((test) => (
              <div key={test._id} className="card p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`${getStatusBadge(test.status)} flex items-center gap-1`}>
                      {getStatusIcon(test.status)}
                      {test.status}
                    </span>
                    {test.isGlobal && (
                      <span className="badge-blue flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Global
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePreviewTest(test._id)}
                      className="p-2 rounded hover:bg-green-500/10 text-[#6b6b70] hover:text-green-500 transition-colors"
                      title="Preview Test"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewTest(test._id)}
                      className="p-2 rounded hover:bg-blue-500/10 text-[#6b6b70] hover:text-blue-500 transition-colors"
                      title="View Test Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditTest(test._id)}
                      className="p-2 rounded hover:bg-amber-500/10 text-[#6b6b70] hover:text-amber-500 transition-colors"
                      title="Edit Test"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test._id, test.title)}
                      className="p-2 rounded hover:bg-red-500/10 text-[#6b6b70] hover:text-red-500 transition-colors"
                      title="Delete Test"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="font-mono font-semibold mb-2">{test.title}</h3>
                  <p className="text-[#6b6b70] text-sm mb-4 line-clamp-2">
                    {test.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6b6b70] flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Duration
                      </span>
                      <span className="text-[#a1a1aa]">{test.settings?.timeLimit || 0} min</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6b6b70] flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Questions
                      </span>
                      <span className="text-[#a1a1aa]">
                        {test.settings?.useSections
                          ? test.sections?.reduce((sum, section) => sum + (section.questions?.length || 0), 0) || 0
                          : test.questions?.length || 0
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#6b6b70] flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Attempts
                      </span>
                      <span className="text-[#a1a1aa]">{test.stats?.totalAttempts || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-[#2a2a2e] flex justify-between items-center">
                  <span className="text-xs text-[#6b6b70]">
                    Created {new Date(test.createdAt).toLocaleDateString()}
                  </span>

                  {test.status === 'draft' && (
                    <button
                      className="btn-primary text-sm py-1.5 flex items-center gap-1"
                      onClick={() => handleStatusChange(test._id, 'active' as TestStatus)}
                    >
                      <Play className="w-3 h-3" />
                      Publish
                    </button>
                  )}

                  {test.status === 'active' && (
                    <button
                      className="btn-secondary text-sm py-1.5 flex items-center gap-1"
                      onClick={() => handleStatusChange(test._id, 'archived' as TestStatus)}
                    >
                      <Archive className="w-3 h-3" />
                      Archive
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTests.length === 0 && (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-[#6b6b70] mx-auto mb-4" />
            <h3 className="font-mono text-lg font-semibold mb-2">No tests found</h3>
            <p className="text-[#6b6b70] mb-6">
              {searchTerm || statusFilter !== 'all' || isGlobalFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Start building your test library by creating your first test.'
              }
            </p>
            <button className="btn-primary flex items-center gap-2 mx-auto" onClick={handleCreateTest}>
              <Plus className="w-4 h-4" />
              Create Your First Test
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card p-6 mt-8">
          <h3 className="font-mono text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className="btn-primary flex items-center gap-2"
              onClick={handleCreateTest}
            >
              <Plus className="w-4 h-4" />
              Create Test
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => navigate('/admin/sessions/active')}
            >
              <Users className="w-4 h-4" />
              View Sessions
            </button>
            <button
              className="btn-secondary flex items-center gap-2"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="modal-backdrop flex items-center justify-center p-4">
          <div className="modal-content w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-mono text-lg font-semibold">Delete Test</h3>
              </div>

              <p className="text-[#a1a1aa] mb-4">
                Are you sure you want to delete this test?
              </p>

              <div className="p-3 bg-[#0a0a0b] rounded-lg mb-4">
                <strong className="text-[#f5f5f4]">"{testToDelete?.title}"</strong>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-6">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#a1a1aa]">
                  This action cannot be undone. The test and all associated sessions and results will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  className="btn-secondary"
                  onClick={cancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger flex items-center gap-2"
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="spinner w-4 h-4" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Test
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagementPage;
