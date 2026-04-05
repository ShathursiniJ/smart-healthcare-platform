import { useState } from "react";

const INITIAL_NOTIFICATIONS = [
  { id: "1", title: "Appointment Confirmed", desc: "Your appointment with Dr. Sarah Fernando on Apr 2 at 10:00 AM has been confirmed.", time: "2 hours ago", type: "appointment", read: false },
  { id: "2", title: "Video Session Reminder", desc: "Your video consultation starts in 30 minutes.", time: "5 hours ago", type: "video", read: false },
  { id: "3", title: "Payment Received", desc: "Payment of LKR 2,500 for consultation with Dr. Fernando processed.", time: "1 day ago", type: "payment", read: true },
  { id: "4", title: "Prescription Ready", desc: "Dr. Kasun has issued a new prescription for your recent visit.", time: "2 days ago", type: "prescription", read: true },
  { id: "5", title: "Health Tip", desc: "Remember to take your medications on time. Stay hydrated!", time: "3 days ago", type: "health", read: true },
];

const typeIcon = {
  appointment: <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  video: <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  payment: <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  prescription: <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  health: <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
};

function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notifications</h1>
          <p className="text-sm text-slate-500">Stay updated on your appointments and health</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm font-medium text-teal-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map(notif => (
          <div key={notif.id}
            onClick={() => markRead(notif.id)}
            className={`flex items-start gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition ${
              notif.read ? "border-slate-200 bg-white" : "border-teal-100 bg-teal-50"
            }`}>
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200">
              {typeIcon[notif.type]}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                {notif.title}
              </p>
              <p className="mt-0.5 text-sm text-slate-500">{notif.desc}</p>
              <p className="mt-1 text-xs text-slate-400">{notif.time}</p>
            </div>
            {!notif.read && (
              <div className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-teal-600" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotificationsPage;