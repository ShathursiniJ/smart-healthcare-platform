import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserNotifications } from '../../services/notificationApi';
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
    if (user && user._id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || !user._id) return;
    
    setLoading(true);
    try {
      const response = await getUserNotifications(user._id, 20, 0);
      if (response.success) {
        const notifs = response.data?.notifications || [];
        setNotifications(notifs);
        // Count unread notifications (those not marked as read)
        const unread = notifs.filter(n => !n.channels?.email?.sent || n.status === 'pending').length;
        setUnreadCount(unread > 0 ? unread : notifs.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
        return '📅';
      case 'appointment_cancelled':
        return '❌';
      case 'consultation_completed':
        return '✅';
      case 'payment_received':
        return '💳';
      case 'doctor_registration':
        return '👨‍⚕️';
      default:
        return '📢';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'appointment_booked':
        return 'border-blue-200 bg-blue-50';
      case 'appointment_cancelled':
        return 'border-red-200 bg-red-50';
      case 'consultation_completed':
        return 'border-emerald-200 bg-emerald-50';
      case 'payment_received':
        return 'border-amber-200 bg-amber-50';
      case 'doctor_registration':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'appointment_booked':
        return 'Appointment Booked';
      case 'appointment_cancelled':
        return 'Appointment Cancelled';
      case 'consultation_completed':
        return 'Consultation Completed';
      case 'payment_received':
        return 'Payment Received';
      case 'doctor_registration':
        return 'Doctor Registration';
      default:
        return 'Notification';
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
                onClick={fetchNotifications}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
              >
                Refresh
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
                  className={`px-5 py-4 border-l-4 hover:bg-slate-50 cursor-pointer transition ${
                    getTypeColor(notif.type)
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{getTypeIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{notif.subject || getTypeLabel(notif.type)}</p>
                      <p className="text-xs text-slate-600 mt-1 break-words line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {getTypeLabel(notif.type)} •{' '}
                        {new Date(notif.createdAt).toLocaleDateString('en-LK', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {notif.type === 'doctor_registration' && (
                        <button
                          onClick={() => {
                            navigate('/admin/verify-doctors');
                            setIsOpen(false);
                          }}
                          className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                        >
                          Review Doctor
                        </button>
                      )}
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
