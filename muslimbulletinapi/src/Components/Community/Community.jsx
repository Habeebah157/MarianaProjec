import React, { useEffect, useState } from "react";

export default function Community() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold text-center mb-8">
        Community Events
      </h1>

      {loading && <p className="text-center">Loading events...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      <div className="flex overflow-x-auto gap-6 p-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-100">
        {events.length === 0 && !loading && (
          <p className="text-center w-full text-blue-600 font-medium">
            No events found.
          </p>
        )}
        {events.map((event) => (
          <div
            key={event.id}
            className="flex-shrink-0 w-72 bg-white border border-blue-300 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between p-5"
          >
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-3">
                {event.title}
              </h2>
              <p className="text-blue-700 text-sm mb-4 leading-snug line-clamp-4">
                {event.description}
              </p>
            </div>
            <button
              className="mt-auto inline-block px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => alert(`Clicked on ${event.title}`)}
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
