import { useState } from 'react';

const NotificationBells = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New message received in your inbox.', read: false, time: '2m' },
    { id: 2, message: 'Don’t miss your scheduled event.', read: false, time: '1h' },
    { id: 3, message: 'You have 5 new answers on your post.', read: true, time: '3d' },
    { id: 4, message: 'A new business member just joined.', read: false, time: '5m' },
    { id: 5, message: 'Prayer time has been updated.', read: true, time: '1d' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 p-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        {notifications.length === 0 ? (
          <p className="text-blue-600 font-medium">No notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex-shrink-0 w-72 border rounded-xl p-5 shadow-md transition duration-300 ${
                n.read
                  ? 'bg-gray-50 border-gray-300'
                  : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">
                    Notification
                  </h2>
                  <p className="text-sm text-gray-700 mb-4 leading-snug">
                    {n.message}
                  </p>
                  <span className="text-xs text-gray-500">{n.time} ago</span>
                </div>
                {!n.read && (
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition"
                    onClick={() => markAsRead(n.id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBells;
