// src/components/navbar/NotificationBell.tsx - Simplified Version
import { AlertTriangle, ArrowRight, Bell, BellOff, RotateCcw, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,
    markAllAsRead,
    reconnect
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group notifications by type for simplified display
  const getGroupedNotifications = () => {
    const groups: Record<string, { count: number; latestMessage: string; route: string }> = {};

    notifications.forEach(notification => {
      if (notification.isRead) return; // Only count unread notifications

      let groupKey = '';
      let route = '';
      let message = '';

      switch (notification.type) {
        case 'attempt_request_submitted':
        case 'attempt_request_pending_review':
          groupKey = 'attempt_requests';
          route = '/admin/attempt-requests';
          message = 'test attempt requests';
          break;
        case 'attempt_request_approved':
        case 'attempt_request_rejected':
          groupKey = 'request_decisions';
          route = '/student/requests';
          message = 'request updates';
          break;
        case 'attempts_granted_directly':
          groupKey = 'direct_grants';
          route = '/student/dashboard';
          message = 'additional attempts granted';
          break;
        case 'system_notification':
        case 'test_related':
          groupKey = 'system';
          route = '/notifications';
          message = 'system notifications';
          break;
        default:
          groupKey = 'other';
          route = '/notifications';
          message = 'notifications';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = { count: 0, latestMessage: message, route };
      }
      groups[groupKey].count++;
    });

    return groups;
  };

  const groupedNotifications = getGroupedNotifications();
  const hasNotifications = Object.keys(groupedNotifications).length > 0;

  // Handle notification group click
  const handleGroupClick = (route: string) => {
    // Mark all as read when user views notifications
    if (unreadCount > 0) {
      markAllAsRead();
    }

    // Navigate to the appropriate page
    window.location.href = route;
    setIsOpen(false);
  };

  // Handle reconnect
  const handleReconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    reconnect();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#a1a1aa] hover:text-[#f5f5f4] transition-colors"
        style={{ minWidth: '44px' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            style={{
              minWidth: '18px',
              height: '18px',
              fontSize: '0.7rem',
              transform: 'translate(25%, -25%)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span
            className="absolute top-0.5 left-0.5 bg-amber-500 rounded-full"
            style={{ width: '8px', height: '8px' }}
            title="Disconnected"
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 bg-[#141416] border border-[#2a2a2e] rounded-lg shadow-xl z-50"
          style={{ width: '320px', maxHeight: '400px' }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-[#2a2a2e] flex justify-between items-center">
            <h6 className="font-mono text-sm font-semibold mb-0">Notifications</h6>
            <div className="flex gap-2">
              {!isConnected && (
                <button
                  className="p-1.5 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                  onClick={handleReconnect}
                  disabled={loading}
                  title="Reconnect"
                >
                  <RotateCcw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-6">
              <Loader2 size={20} className="animate-spin text-blue-500 mx-auto" />
              <div className="text-[#6b6b70] mt-2 text-sm">Loading notifications...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="px-3 py-6 text-center">
              <div className="text-red-400 mb-2">
                <AlertTriangle size={20} className="mx-auto" />
              </div>
              <div className="text-[#6b6b70] text-sm mb-2">{error}</div>
              <button
                className="btn-secondary text-xs flex items-center gap-1 mx-auto"
                onClick={handleReconnect}
              >
                <RotateCcw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* Simplified Notifications List */}
          {!loading && !error && (
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              {!hasNotifications ? (
                <div className="px-3 py-6 text-center text-[#6b6b70]">
                  <BellOff size={32} className="mb-2 mx-auto opacity-30" />
                  <div className="text-sm">No new notifications</div>
                </div>
              ) : (
                <div>
                  {Object.entries(groupedNotifications).map(([key, group]) => (
                    <button
                      key={key}
                      onClick={() => handleGroupClick(group.route)}
                      className="w-full text-left px-3 py-3 border-b border-[#2a2a2e] hover:bg-[#1a1a1e] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="bg-blue-500 rounded-full mr-3"
                            style={{ width: '8px', height: '8px' }}
                          />
                          <div>
                            <div className="font-medium text-[#f5f5f4] text-sm">
                              {group.count} new {group.latestMessage}
                            </div>
                            <div className="text-[#6b6b70] text-xs">
                              Click to view details
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-[#6b6b70]" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {hasNotifications && !loading && !error && (
            <div className="px-3 py-2 border-t border-[#2a2a2e] text-center">
              <small className="text-[#6b6b70]">
                Click any notification to view and mark as read
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
