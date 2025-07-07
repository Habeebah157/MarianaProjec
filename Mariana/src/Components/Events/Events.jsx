import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleClick = () => {
    navigate("/createEvent");
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:9000/events/", {
          headers: {
            token: localStorage.token,
          },
        });
        const data = await res.json();
        if (data.success) {
          setEvents(data.events);
        } else {
          setError(data.message || "Failed to load events");
        }
      } catch (err) {
        setError("Network error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const filteredEvents = {
      All: events,
      Today: events.filter(
        (e) => new Date(e.start_time).toISOString().split("T")[0] === todayStr,
      ),
      Upcoming: events.filter((e) => new Date(e.start_time) > now),
      Past: events.filter((e) => new Date(e.start_time) < now),
    };

    setFiltered(filteredEvents[tab]);
  }, [tab, events]);

  const tabs = ["All", "Today", "Upcoming", "Past"];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🎟️ Events</h2>
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700"
        >
          + Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b pb-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1 rounded-t text-sm font-medium ${
              tab === t
                ? "bg-blue-600 text-white"
                : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Error/Loading */}
      {loading && <p>Loading events...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-gray-600">No events found for "{tab}"</p>
      )}

      {/* Event Cards */}
      <div className="space-y-6">
        {filtered.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  to={`/EventDetail/${event.id}`}
                  state={{ eventData: events }}
                  className="text-xl font-semibold text-blue-700 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-gray-500">
                  {new Date(event.start_time).toLocaleDateString()} &bull;{" "}
                  {new Date(event.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {event.end_time &&
                    ` - ${new Date(event.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  📍 {event.location}
                </p>
              </div>
              <p className="text-sm text-right text-gray-500 italic mt-3 sm:mt-0">
                Hosted by: {event.user_name}
              </p>
            </div>

            <p className="mt-4 text-gray-800">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
