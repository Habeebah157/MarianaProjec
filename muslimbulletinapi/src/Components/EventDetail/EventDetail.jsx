import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import RSVP from "../RSVP/RSVP";


// const { eventId } = useParams();
//   const location = useLocation();

//   // Get the array of events
//   const events = location.state?.eventData || [];

//   // Find the specific event
//   const event = events.find((e) => String(e.id) === eventId);

//   if (!event) {
//     return <div>Event not found</div>; // Optional: add fallback UI
//   }

function formatTime(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes();

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // convert 0 to 12

  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return `${hours}:${formattedMinutes} ${ampm}`;
}

// Import marker images directly
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// import { useEffect } from "react";

// Fix for default marker icons
const eventMarkerIcon = new L.Icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [30, 45],
  iconAnchor: [15, 45],
  popupAnchor: [1, -40],
  shadowSize: [45, 45],
});

// function formatTime(dateString) {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   let hours = date.getHours();
//   const minutes = date.getMinutes();
//   const ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12;
//   const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
//   return `${hours}:${formattedMinutes} ${ampm}`;
// }

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

  try {
    const requestBody = {
      question: newComment, // assuming newComment is the question
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

      // Add comment to UI
      if (newComment.trim()) {
        setComments(prev => [
          ...prev,
          {
            text: newComment,
            id: Date.now(),
            timestamp: new Date().toLocaleString()
          }
        ]);
        setNewComment("");
      }
    } else {
      alert("Failed to save question");
    }
  } catch (err) {
    console.error("This is a problem", err);
    alert("An error occurred while submitting your comment");
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-indigo-600 hover:to-blue-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            ← Back to Events
          </button>
        </article>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        aria-label="Go back to events list"
        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-semibold mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </button>

      {/* Two-column layout: RSVP on left, main info on right */}
      <div className="flex flex-col md:flex-row gap-10">
        {/* Left Column: RSVP */}
        <aside className="md:w-1/3 sticky top-20 self-start bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <RSVP eventId={eventId} />
          <button
    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow"
    type="button"
  >
    Add to Google Calendar
  </button>
        </aside>


        {/* Right Column: Event Details + Comments */}
        <article className="md:w-2/3 space-y-10 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Event Header */}
          <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900">{event.title}</h1>
            <span className="mt-3 md:mt-0 inline-block px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold tracking-wide text-sm shadow-sm">
              {event.event_type || "Event"}
            </span>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-700">
            {/* Date */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold tracking-wide">Date</p>
                <p className="text-lg font-semibold">{formatDateWithOrdinal(event.start_time)}</p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold tracking-wide">Time</p>
                <p className="text-lg font-semibold">
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13 21.314l-4.657-4.657a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase font-semibold tracking-wide">Location</p>
                <address className="not-italic text-lg font-semibold">{event.location || "Online/To be announced"}</address>
              </div>
            </div>
          </div>

          {/* Description */}
          <section className="mt-8 prose prose-indigo max-w-none text-gray-800">
            <h2 className="text-2xl font-bold mb-3">About the Event</h2>
            <p>{event.description || "No description provided for this event."}</p>
          </section>

          {/* Map */}
          {event.latitude && event.longitude && (
            <div className="mt-10 rounded-xl overflow-hidden shadow-lg">
              <MapContainer
                center={[event.latitude, event.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "300px", width: "100%" }}
                aria-label="Event Location Map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[event.latitude, event.longitude]} icon={eventMarkerIcon}>
                  <Popup>{event.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {/* Questions & Comments */}
          <section className="mt-12">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-indigo-300 pb-2">
              Questions & Comments
            </h2>

            {/* New Comment Input */}
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <textarea
                aria-label="Add a comment or question"
                placeholder="Have a question or comment? Write it here..."
                className="w-full rounded-lg border border-gray-300 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 && (
                <p className="text-gray-500 italic">No questions or comments yet. Be the first!</p>
              )}
              {comments.map(({ id, question, created_at, user_name }) => (
                <article
                  key={id}
                  className="p-5 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-shadow"
                  tabIndex={0}
                  aria-label={`Comment by ${user_name} on ${new Date(created_at).toLocaleDateString()}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-indigo-800">{user_name || "Anonymous"}</h3>
                    <time
                      dateTime={created_at}
                      className="text-xs text-gray-500 font-mono"
                      title={new Date(created_at).toLocaleString()}
                    >
                      {new Date(created_at).toLocaleDateString()}
                    </time>
                  </div>
                  <p className="mb-4">{question}</p>

                  {/* Replies */}
                  <div className="ml-6 space-y-3">
                    {(replies[id] || []).map((reply, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-indigo-100 rounded-lg text-indigo-900 text-sm shadow-sm"
                        aria-label={`Reply ${index + 1} to comment by ${user_name}`}
                      >
                        {reply}
                      </div>
                    ))}

                    {/* Reply Input */}
                    <form onSubmit={(e) => handleReplySubmit(e, id)} className="mt-2 flex gap-3">
                      <input
                        type="text"
                        aria-label={`Reply to comment by ${user_name}`}
                        className="flex-grow rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={replyInputs[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <button
                        type="submit"
                        className="px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
