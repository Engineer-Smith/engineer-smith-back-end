// src/pages/admin/OrganizationsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  Crown,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/ApiService';

interface Organization {
  _id: string;
  name: string;
  isSuperOrg: boolean;
  userCount: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
  createdAt?: string;
}

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is super org admin
  const isSuperOrgAdmin = user?.organization?.isSuperOrg && user?.role === 'admin';

  useEffect(() => {
    if (!isSuperOrgAdmin) {
      navigate('/admin');
      return;
    }
    fetchOrganizations();
  }, [isSuperOrgAdmin, navigate]);

  const fetchOrganizations = async () => {
    try {
      setError(null);
      // Fetch from admin dashboard which includes organizations for super admins
      const response = await apiService.getUserDashboard({});
      setOrganizations(response.organizations || []);
    } catch (err: any) {
      console.error('Failed to fetch organizations:', err);
      setError(err.response?.data?.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrganizations();
  };

  const filteredOrgs = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate totals
  const totalUsers = organizations.reduce((sum, org) => sum + org.userCount, 0);
  const totalOrgs = organizations.length;

  if (!isSuperOrgAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-[#a1a1aa] mb-4">
            Only super organization administrators can access this page.
          </p>
          <button onClick={() => navigate('/admin')} className="btn-primary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-[#a1a1aa]">Loading organizations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="card p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Organizations</h2>
          <p className="text-[#a1a1aa] mb-4">{error}</p>
          <button onClick={fetchOrganizations} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-[#f5f5f4] mb-2">
              Organizations
            </h1>
            <p className="text-[#a1a1aa]">
              Manage organizations and their members
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/admin/organizations/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Organization
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-4 text-center">
            <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{totalOrgs}</p>
            <p className="text-xs text-[#6b6b70]">Organizations</p>
          </div>
          <div className="card p-4 text-center">
            <Users className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">{totalUsers}</p>
            <p className="text-xs text-[#6b6b70]">Total Users</p>
          </div>
          <div className="card p-4 text-center">
            <Shield className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">
              {organizations.reduce((sum, org) => sum + org.adminCount, 0)}
            </p>
            <p className="text-xs text-[#6b6b70]">Total Admins</p>
          </div>
          <div className="card p-4 text-center">
            <Crown className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-[#f5f5f4]">
              {organizations.filter(o => o.isSuperOrg).length}
            </p>
            <p className="text-xs text-[#6b6b70]">Super Orgs</p>
          </div>
        </div>

        {/* Search */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6b70]" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
              />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        <div className="card">
          <div className="p-4 border-b border-[#2a2a2e] flex items-center justify-between">
            <h2 className="font-mono font-semibold">All Organizations</h2>
            <span className="text-sm text-[#6b6b70]">{filteredOrgs.length} organizations</span>
          </div>

          {filteredOrgs.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-[#3a3a3f] mx-auto mb-4" />
              <p className="text-[#6b6b70]">
                {searchQuery ? 'No organizations found matching your search' : 'No organizations found'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#2a2a2e]">
              {filteredOrgs.map(org => (
                <div
                  key={org._id}
                  className="p-4 hover:bg-[#1c1c1f]/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        org.isSuperOrg ? 'bg-purple-500/10' : 'bg-blue-500/10'
                      }`}>
                        {org.isSuperOrg ? (
                          <Crown className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#f5f5f4]">{org.name}</h3>
                          {org.isSuperOrg && (
                            <span className="badge-purple text-xs">Super Org</span>
                          )}
                        </div>
                        <p className="text-sm text-[#6b6b70]">
                          {org.userCount} users
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-[#f5f5f4]">{org.adminCount}</p>
                          <p className="text-xs text-[#6b6b70]">Admins</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-[#f5f5f4]">{org.instructorCount}</p>
                          <p className="text-xs text-[#6b6b70]">Instructors</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-[#f5f5f4]">{org.studentCount}</p>
                          <p className="text-xs text-[#6b6b70]">Students</p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/admin/users?orgId=${org._id}`)}
                        className="btn-secondary text-sm"
                      >
                        View Users
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
