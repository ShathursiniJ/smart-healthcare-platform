import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '../../services/paymentApi';
import { useAuth } from '../../features/auth/AuthContext';

function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount and poll every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        getMyNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notifRes.data?.notifications || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment':
        return '📅';
      case 'payment':
        return '💳';
      case 'consultation':
        return '🏥';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment':
        return 'border-blue-200 bg-blue-50';
      case 'payment':
        return 'border-emerald-200 bg-emerald-50';
      case 'consultation':
        return 'border-purple-200 bg-purple-50';
      case 'system':
        return 'border-slate-200 bg-slate-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-800 transition"
        title="Notifications"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 w-96 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleMarkAsRead(notif._id)}
                  className={`px-5 py-4 border-l-4 border-slate-200 hover:bg-slate-50 cursor-pointer transition ${
                    getTypeColor(notif.type)
                  } ${!notif.isRead ? 'font-medium bg-slate-50' : 'text-slate-600'}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{getTypeIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-xs text-slate-600 mt-1 break-words">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2 capitalize">
                        {notif.type} •{' '}
                        {new Date(notif.createdAt).toLocaleDateString('en-LK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="ml-2 flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-200 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Close on outside click */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}
    </div>
  );
}

export default NotificationBell;
