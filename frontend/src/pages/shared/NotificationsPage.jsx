import { useState, useEffect } from 'react';
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/paymentApi';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, payment, appointment, consultation

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications();
      setNotifications(res.data?.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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
        return 'border-l-blue-500 bg-blue-50';
      case 'payment':
        return 'border-l-emerald-500 bg-emerald-50';
      case 'consultation':
        return 'border-l-purple-500 bg-purple-50';
      case 'system':
        return 'border-l-slate-500 bg-slate-50';
      default:
        return 'border-l-slate-500 bg-slate-50';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter !== 'all') return notif.type === filter;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated with all your notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: '📌 All', icon: '' },
          { key: 'unread', label: '🆕 Unread', icon: '' },
          { key: 'appointment', label: '📅 Appointments', icon: '' },
          { key: 'payment', label: '💳 Payments', icon: '' },
          { key: 'consultation', label: '🏥 Consultations', icon: '' },
          { key: 'system', label: '⚙️ System', icon: '' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
              filter === tab.key
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-24 rounded-2xl border bg-white" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="text-4xl mb-3">{getTypeIcon('system')}</div>
            <p className="text-slate-600 font-medium">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === 'unread' ? 'All caught up!' : 'You will receive notifications about your appointments, payments, and system updates.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif._id}
              onClick={() => handleMarkAsRead(notif._id)}
              className={`rounded-2xl border-l-4 border border-slate-200 p-5 cursor-pointer transition hover:shadow-md ${
                getTypeColor(notif.type)
              } ${!notif.isRead ? 'ring-1 ring-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{getTypeIcon(notif.type)}</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-800">{notif.title}</h3>
                      <p className="text-slate-600 mt-1 break-words">{notif.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString('en-LK', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {!notif.isRead && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-1" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
