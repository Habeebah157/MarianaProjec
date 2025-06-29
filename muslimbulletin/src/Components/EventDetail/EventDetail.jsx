import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import RSVP from "../RSVP/RSVP";

// Fix Leaflet marker icons
const eventMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -40],
  shadowSize: [45, 45],
});

function formatTime(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${formattedMinutes} ${ampm}`;
}

function formatDateWithOrdinal(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  return `${month} ${day}${suffix}, ${year}`;
}

export default function EventDetail() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const passedEvents = location.state?.eventData || [];
  const event = passedEvents.find((e) => String(e.id) === eventId);

  const handleBack = () => navigate("/events");

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestBody = {
        question: newComment,
        eventId
      };

      const res = await fetch(`http://localhost:9000/eventquestion`, {
        method: "POST",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const returnjson = await res.json();

      if (returnjson.success) {
        alert("Question saved successfully");

        const savedComment = returnjson.data;

        setComments(prev => [
          ...prev,
          {
            id: savedComment.id,
            question: savedComment.question,
            created_at: savedComment.created_at,
            user_name: savedComment.user_name || "Anonymous"
          }
        ]);

        setNewComment("");
      } else {
        alert("Failed to save question");
      }
    } catch (err) {
      console.error("This is a problem", err);
      alert("An error occurred while submitting your comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReplySubmit = (e, commentId) => {
    e.preventDefault();
    const replyText = replyInputs[commentId]?.trim();
    if (!replyText) return;

    setReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), replyText],
    }));
    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
  };

  if (!event) {
    return (
      <section className="max-w-4xl mx-auto p-6 text-center">
        <article className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Event Not Found</h1>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-indigo-600 hover:to-blue-600 transition-transform transform hover:scale-105"
          >
            ← Back to Events
          </button>
        </article>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-semibold mb-6"
      >
        ← Back to Events
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="md:w-1/3 sticky top-20 self-start bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <RSVP eventId={eventId} />
          <button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow">
            Add to Google Calendar
          </button>
        </aside>

        <article className="md:w-2/3 space-y-10 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900">{event.title}</h1>
            <span className="mt-3 md:mt-0 inline-block px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
              {event.event_type || "Event"}
            </span>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                📅
              </div>
              <div>
                <p className="text-xs uppercase font-semibold">Date</p>
                <p className="text-lg font-semibold">{formatDateWithOrdinal(event.start_time)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                ⏰
              </div>
              <div>
                <p className="text-xs uppercase font-semibold">Time</p>
                <p className="text-lg font-semibold">
                  {formatTime(event.start_time)} – {formatTime(event.end_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                📍
              </div>
              <div>
                <p className="text-xs uppercase font-semibold">Location</p>
                <address className="not-italic text-lg font-semibold">{event.location || "Online / TBD"}</address>
              </div>
            </div>
          </div>

          <section className="mt-8 text-gray-800">
            <h2 className="text-2xl font-bold mb-3">About the Event</h2>
            <p>{event.description || "No description provided."}</p>
          </section>

          {event.latitude && event.longitude && (
            <MapContainer
              center={[event.latitude, event.longitude]}
              zoom={13}
              scrollWheelZoom={false}
              style={{ height: "300px", width: "100%" }}
              className="rounded-lg shadow overflow-hidden"
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[event.latitude, event.longitude]} icon={eventMarkerIcon}>
                <Popup>{event.title}</Popup>
              </Marker>
            </MapContainer>
          )}

          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6">Questions & Comments</h2>

            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                placeholder="Have a question or comment? Write it here..."
                className="w-full rounded-lg border border-gray-300 p-3 resize-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>

            <div className="space-y-6">
              {comments.length === 0 && (
                <p className="text-gray-500 italic">No comments yet. Be the first!</p>
              )}
              {comments.map(({ id, question, created_at, user_name }) => (
                <article key={id} className="p-5 border rounded-lg shadow-sm bg-gray-50">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-indigo-800">{user_name}</h3>
                    <time className="text-xs text-gray-500 font-mono">
                      {new Date(created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mb-4">{question}</p>

                  <div className="ml-6 space-y-3">
                    {(replies[id] || []).map((reply, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-900 text-sm"
                      >
                        {reply}
                      </div>
                    ))}

                    <form onSubmit={(e) => handleReplySubmit(e, id)} className="mt-2 flex gap-3">
                      <input
                        type="text"
                        className="flex-grow rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-400"
                        value={replyInputs[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <button
                        type="submit"
                        className="px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        disabled={!replyInputs[id]?.trim()}
                      >
                        Reply
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}
