import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUserNotifications } from "../../services/notificationApi";
import { useAuth } from "../../features/auth/AuthContext";

function NotificationBell() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.id || user?._id;

  const notificationsRoute = useMemo(() => {
    if (user?.role === "admin") return "/admin/notifications";
    if (user?.role === "doctor") return "/doctor/notifications";
    return "/patient/notifications";
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await getUserNotifications(userId, 20, 0);
      if (response.success) {
        const notifs = response.data?.notifications || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => navigate(notificationsRoute)}
        className="relative rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 focus:outline-none"
      >
        <span className="sr-only">View notifications</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

export default NotificationBell;