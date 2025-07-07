// Dashboard.jsx
import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedEvents = localStorage.getItem("events");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedEvents) setEvents(JSON.parse(savedEvents));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome back, <span className="text-blue-600">{user?.name}</span>!
          </h1>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Events Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
            Your Upcoming Events
          </h2>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-5 transition-all duration-200 border-l-4 border-blue-500"
                >
                  <div className="text-sm text-gray-500 mb-2">
                    {new Date(event.start.dateTime).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      },
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    {event.summary}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {new Date(event.start.dateTime).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No upcoming events scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
