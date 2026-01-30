import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Hammer,
  Menu,
  X,
  Settings,
  Code,
  Building2,
  User,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogIn,
  UserPlus,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginInputs, setShowLoginInputs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loginData, setLoginData] = useState({ loginId: '', password: '' });

  const { user, isAuthenticated, login, logout, loading: authLoading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const toggle = () => setIsOpen(!isOpen);

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setShowLoginInputs(false);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loginData.loginId && loginData.password) {
      clearError();
      await login(loginData.loginId, loginData.password);
      if (!authError) {
        setLoginData({ loginId: '', password: '' });
        setShowLoginInputs(false);
      }
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const isActivePath = (path: string) => currentPath === path || currentPath.startsWith(path);
  const hasAdminAccess = user?.role === 'admin' || user?.role === 'instructor';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-[#2a2a2e]">
      <div className="container-section">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavClick(isAuthenticated ? '/dashboard' : '/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center glow-amber group-hover:scale-105 transition-transform">
              <Hammer className="w-5 h-5 text-[#0a0a0b]" />
            </div>
            <span className="font-mono text-xl font-bold text-gradient">EngineerSmith</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {!isAuthenticated ? (
              <>
                <NavLink onClick={() => handleNavClick('/features')} active={isActivePath('/features')}>
                  <Settings className="w-4 h-4" />
                  Features
                </NavLink>
                <NavLink onClick={() => handleNavClick('/languages')} active={isActivePath('/languages')}>
                  <Code className="w-4 h-4" />
                  Languages
                </NavLink>
                <NavLink onClick={() => handleNavClick('/for-organizations')} active={isActivePath('/for-organizations')}>
                  <Building2 className="w-4 h-4" />
                  Organizations
                </NavLink>
                <NavLink onClick={() => handleNavClick('/for-individuals')} active={isActivePath('/for-individuals')}>
                  <User className="w-4 h-4" />
                  Individuals
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  onClick={() => handleNavClick('/dashboard')}
                  active={isActivePath('/dashboard') || isActivePath('/admin') || isActivePath('/student-dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink onClick={() => handleNavClick('/code-lab')} active={isActivePath('/code-lab')}>
                  <Code className="w-4 h-4" />
                  Code Lab
                </NavLink>
                {user?.role === 'student' && (
                  <>
                    <NavLink onClick={() => handleNavClick('/tests')} active={isActivePath('/tests')}>
                      <ClipboardList className="w-4 h-4" />
                      Tests
                    </NavLink>
                    <NavLink onClick={() => handleNavClick('/results')} active={isActivePath('/results')}>
                      <BarChart3 className="w-4 h-4" />
                      Results
                    </NavLink>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowLoginInputs(!showLoginInputs)}
                  className="hidden md:flex btn-ghost text-sm items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Get Started</span>
                </button>
              </>
            ) : (
              <>
                <NotificationBell />

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1c1c1f] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-500 font-medium text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </span>
                    </div>
                    <span className="hidden md:block text-sm text-[#f5f5f4]">{user?.firstName}</span>
                    <ChevronDown className={`w-4 h-4 text-[#6b6b70] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full mt-2 w-56 card p-2 shadow-xl">
                      <div className="px-3 py-2 border-b border-[#2a2a2e] mb-2">
                        <p className="text-sm font-medium text-[#f5f5f4]">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-[#6b6b70]">@{user?.loginId}</p>
                        <span className="badge-amber text-xs mt-1 inline-block">{user?.role}</span>
                      </div>

                      {hasAdminAccess && (
                        <>
                          <MenuButton onClick={() => handleNavClick('/admin/question-bank')}>
                            Question Bank
                          </MenuButton>
                          <MenuButton onClick={() => handleNavClick('/admin/tests')}>
                            Test Management
                          </MenuButton>
                          <MenuButton onClick={() => handleNavClick('/admin/code-lab')}>
                            Code Lab Admin
                          </MenuButton>
                          <MenuButton onClick={() => handleNavClick('/admin/users')}>
                            User Management
                          </MenuButton>
                          <MenuButton onClick={() => handleNavClick('/admin/results')}>
                            Results Dashboard
                          </MenuButton>
                          <div className="border-t border-[#2a2a2e] my-2" />
                        </>
                      )}

                      <MenuButton onClick={() => handleNavClick('/profile')}>
                        Profile Settings
                      </MenuButton>
                      <MenuButton onClick={handleLogout} className="text-red-400 hover:text-red-300">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </MenuButton>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <button onClick={toggle} className="md:hidden p-2 text-[#a1a1aa] hover:text-[#f5f5f4]">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Quick Login Form */}
        {!isAuthenticated && showLoginInputs && (
          <div className="hidden md:block pb-4 border-t border-[#2a2a2e] mt-4 pt-4">
            <form onSubmit={handleLogin} className="flex items-center gap-3 max-w-xl mx-auto">
              <input
                type="text"
                name="loginId"
                placeholder="Username or Email"
                value={loginData.loginId}
                onChange={handleInputChange}
                className="input flex-1 py-2"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleInputChange}
                className="input flex-1 py-2"
              />
              <button type="submit" disabled={authLoading} className="btn-primary py-2">
                {authLoading ? <div className="spinner w-4 h-4" /> : 'Login'}
              </button>
            </form>
            {authError && (
              <p className="text-red-400 text-sm text-center mt-2">{authError}</p>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-[#2a2a2e] mt-4 pt-4 space-y-2">
            {!isAuthenticated ? (
              <>
                <MobileNavLink onClick={() => handleNavClick('/features')}>Features</MobileNavLink>
                <MobileNavLink onClick={() => handleNavClick('/languages')}>Languages</MobileNavLink>
                <MobileNavLink onClick={() => handleNavClick('/for-organizations')}>Organizations</MobileNavLink>
                <MobileNavLink onClick={() => handleNavClick('/for-individuals')}>Individuals</MobileNavLink>
                <div className="border-t border-[#2a2a2e] my-3" />
                <MobileNavLink onClick={() => handleNavClick('/login')}>Sign In</MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink onClick={() => handleNavClick('/dashboard')}>Dashboard</MobileNavLink>
                <MobileNavLink onClick={() => handleNavClick('/code-lab')}>Code Lab</MobileNavLink>
                {user?.role === 'student' && (
                  <>
                    <MobileNavLink onClick={() => handleNavClick('/tests')}>Available Tests</MobileNavLink>
                    <MobileNavLink onClick={() => handleNavClick('/results')}>My Results</MobileNavLink>
                  </>
                )}
                {hasAdminAccess && (
                  <>
                    <div className="border-t border-[#2a2a2e] my-3" />
                    <MobileNavLink onClick={() => handleNavClick('/admin/question-bank')}>Question Bank</MobileNavLink>
                    <MobileNavLink onClick={() => handleNavClick('/admin/tests')}>Test Management</MobileNavLink>
                    <MobileNavLink onClick={() => handleNavClick('/admin/code-lab')}>Code Lab Admin</MobileNavLink>
                    <MobileNavLink onClick={() => handleNavClick('/admin/users')}>User Management</MobileNavLink>
                  </>
                )}
                <div className="border-t border-[#2a2a2e] my-3" />
                <MobileNavLink onClick={handleLogout}>Sign Out</MobileNavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

// Helper Components
const NavLink = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'text-amber-500 bg-amber-500/10'
        : 'text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f]'
    }`}
  >
    {children}
  </button>
);

const MobileNavLink = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className="block w-full text-left px-4 py-3 text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] rounded-lg transition-colors"
  >
    {children}
  </button>
);

const MenuButton = ({ onClick, children, className = '' }: { onClick: () => void; children: React.ReactNode; className?: string }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 text-sm text-[#a1a1aa] hover:text-[#f5f5f4] hover:bg-[#1c1c1f] rounded-lg transition-colors flex items-center gap-2 ${className}`}
  >
    {children}
  </button>
);

export default AppNavbar;
