import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import RSVP from "../RSVP/RSVP";

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
  const [answers, setAnswers] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyInputs, setReplyInputs] = useState({});
  const [replies, setReplies] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const passedEvents = location.state?.eventData || [];
  const event = passedEvents.find((e) => String(e.id) === eventId);

  const handleBack = () => navigate("/events");

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:9000/eventquestion/${eventId}`, {
          headers: {
            token: localStorage.token,
          },
        });
        const json = await res.json();
        if (json.success) {
          setComments(json.data);
        } else {
          console.error("Failed to load comments:", json.message || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching event questions:", err);
      }
    };

    const fetchAnswers = async () => {
      try {
        const res = await fetch(`http://localhost:9000/eventquestionanswer/${eventId}`, {
          headers: {
            token: localStorage.token,
          },
        });
        const json = await res.json();
        if (json.success) {
          setAnswers(json.data);
        } else {
          console.error("Failed to load answers:", json.message || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching answers:", err);
      }
    };

    if (eventId) {
      fetchComments();
      fetchAnswers();
    }
  }, [eventId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`http://localhost:9000/eventquestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify({
          question: newComment,
          eventId: eventId,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to submit question");
      }

      if (responseData.success) {
        const res = await fetch(`http://localhost:9000/eventquestion/${eventId}`, {
          headers: {
            token: localStorage.token,
          },
        });
        const json = await res.json();
        if (json.success) {
          setComments(json.data);
        }
        setNewComment("");
      } else {
        alert(responseData.message || "Failed to submit question");
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      alert(err.message || "An error occurred while submitting your question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (e, questionId) => {
    e.preventDefault();
    const answerText = replyInputs[questionId]?.trim();
    if (!answerText) return;
    setIsSubmittingReply(true);

    try {
      const tempId = Date.now().toString();
      setReplies(prev => ({
        ...prev,
        [questionId]: [
          ...(prev[questionId] || []),
          { id: tempId, text: answerText, question_id: questionId }
        ]
      }));

      const res = await fetch(`http://localhost:9000/eventquestionanswer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: answerText,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to submit answer");
      }

      if (responseData.success) {
        setReplies(prev => ({
          ...prev,
          [questionId]: prev[questionId].map(reply => 
            reply.id === tempId ? responseData.data : reply
          )
        }));
        setReplyInputs(prev => ({ ...prev, [questionId]: "" }));
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      // Rollback optimistic update
      setReplies(prev => ({
        ...prev,
        [questionId]: prev[questionId].filter(reply => reply.id !== tempId)
      }));
      alert(err.message || "An error occurred while submitting your answer");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleInputChange = (commentId, value) => {
    setReplyInputs((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const res = await fetch(`http://localhost:9000/eventquestion/${commentId}`, {
        method: "DELETE",
        headers: {
          token: localStorage.token,
        },
      });

      const json = await res.json();

      if (json.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        alert("Failed to delete comment");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("An error occurred while deleting the comment");
    }
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
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">📅</div>
              <div>
                <p className="text-xs uppercase font-semibold">Date</p>
                <p className="text-lg font-semibold">{formatDateWithOrdinal(event.start_time)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">⏰</div>
              <div>
                <p className="text-xs uppercase font-semibold">Time</p>
                <p className="text-lg font-semibold">
                  {formatTime(event.start_time)} – {formatTime(event.end_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">📍</div>
              <div>
                <p className="text-xs uppercase font-semibold">Location</p>
                <address className="not-italic text-lg font-semibold">
                  {event.location || "Online / TBD"}
                </address>
              </div>
            </div>
          </div>

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
                required
              />
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </form>

            <div className="space-y-6">
              {comments.length === 0 && (
                <p className="text-gray-500 italic">No questions yet. Be the first!</p>
              )}
              {comments.map(({ id, question, created_at, user_name, canDelete }) => {
                const questionAnswers = answers.filter((a) => a.question_id === id);
                const questionReplies = replies[id] || [];

                return (
                  <article key={id} className="p-5 border rounded-lg shadow-sm bg-gray-50">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold text-indigo-800">{user_name}</h3>
                      <div className="flex items-center gap-3">
                        <time className="text-xs text-gray-500 font-mono">
                          {new Date(created_at).toLocaleDateString()}
                        </time>
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-red-500 text-xs font-semibold hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mb-4">{question}</p>

                    {/* Answers from backend */}
                    <div className="ml-4 space-y-2">
                      {questionAnswers.map(({ id: answerId, answer, user_name, is_official }) => (
                        <div
                          key={answerId}
                          className={`p-3 rounded-md text-sm ${
                            is_official
                              ? "bg-blue-100 border border-blue-400 text-blue-900 font-semibold"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <strong>{user_name}{is_official ? " (Official)" : ""}:</strong> {answer}
                          <div className="text-xs text-gray-500 mt-1">
                            Answer ID: {answerId} | Question ID: {id}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Local replies (optimistic updates) */}
                    {questionReplies.map((reply) => (
                      <div key={reply.id} className="ml-4 mt-2 px-4 py-2 bg-indigo-100 rounded-lg text-indigo-900 text-sm">
                        <div>You: {reply.text}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Reply ID: {reply.id} | Question ID: {id}
                        </div>
                      </div>
                    ))}

                    <form
                      onSubmit={(e) => handleAnswerSubmit(e, id)}
                      className="mt-4 flex gap-3"
                    >
                      <input
                        type="text"
                        className="flex-grow rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-400"
                        value={replyInputs[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        placeholder="Write a reply..."
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingReply || !replyInputs[id]?.trim()}
                        className="px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                      >
                        {isSubmittingReply ? "Posting..." : "Reply"}
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}