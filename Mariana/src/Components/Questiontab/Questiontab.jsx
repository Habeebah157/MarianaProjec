import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaComment } from "react-icons/fa";
import { formatDistanceToNow, parseISO } from "date-fns";
import Navbar from "../Navbar/Navbar";
import Chatbot from "../Chatbot/Chatbot";

function timeAgo(dateString) {
  try {
    if (!dateString) return "some time ago";

    // First try parsing as ISO string
    let date = parseISO(dateString);
    if (!isNaN(date.getTime())) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    // If that fails, try creating new Date directly
    date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    // If still failing, try common SQL timestamp format
    const sqlDate = dateString.replace(" ", "T") + "Z";
    date = new Date(sqlDate);
    if (!isNaN(date.getTime())) {
      return formatDistanceToNow(date, { addSuffix: true });
    }

    return "some time ago";
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "some time ago";
  }
}

export default function Questiontab() {
  const [questions, setQuestions] = useState([]);
  const [reactions, setReactions] = useState({});

  const uploadQuestions = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:9000/questions", {
        method: "GET",
        headers: { token: localStorage.token },
      });
      const uploadedQuestions = await res.json();
      console.log("Questions fetched:", uploadedQuestions);
      if (uploadedQuestions && uploadedQuestions.questions) {
        setQuestions(uploadedQuestions.questions);

        const initialReactions = {};
        uploadedQuestions.questions.forEach((q) => {
          initialReactions[q.id] = {
            userReaction: q.user_reaction || null,
            likeCount: q.like_count || 0,
            dislikeCount: q.dislike_count || 0,
          };
        });
        setReactions(initialReactions);
      }
    } catch (err) {
      console.error(err.message);
    }
  }, []);

  useEffect(() => {
    uploadQuestions();
  }, [uploadQuestions]);

  const sendReaction = async (question_id, vote) => {
    try {
      const res = await fetch("http://localhost:9000/question_votes/question_votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        }
        // body: JSON.stringify({ question_id, vote }),
      });
      const data = await res.json();
      console.log("Vote response:", data);
      if (res.ok) {
        setReactions((prev) => ({
          ...prev,
          [question_id]: {
            userReaction: vote,
            likeCount: data.like_count,
            dislikeCount: data.dislike_count,
          },
        }));
      } else {
        console.error("Vote error:", data.error);
      }
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-end">
        <Link
          to="/createPost"
          className="
            flex items-center justify-center gap-2
            border-2 border-blue-900 
            p-3 px-5 
            m-4 
            bg-gradient-to-r from-blue-700 to-blue-600 
            text-white 
            font-medium 
            rounded-lg 
            shadow-md 
            hover:from-blue-600 hover:to-blue-500 
            hover:shadow-lg 
            hover:scale-[1.02]
            transform 
            transition-all 
            duration-300 
            ease-in-out
          "
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Create Post
        </Link>
      </div>

      {questions.map((question) => {
        const reaction = reactions[question.id] || {
          userReaction: null,
          likeCount: 0,
          dislikeCount: 0,
        };

        // Add debug logging for the date
        console.log("Original date:", question.created_at);
        const timeAgoText = timeAgo(question.created_at);
        console.log("Formatted date:", timeAgoText);

        return (
          <div
            key={question.id}
            className="border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden my-6 mx-2"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${question.user_name}&background=random&length=1`}
                  alt="User profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md hover:scale-105 transition-transform duration-200"
                />
                <Link
                  to={`/profile/${question.user_id}`}
                  className="hover:underline text-gray-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <h5 className="text-sm font-semibold">
                    {question.user_name}
                  </h5>
                </Link>
                <span className="text-xs text-gray-500 ml-auto">
                  {timeAgoText}
                </span>
              </div>

              <div className="mb-4">
                <Link to={`/question/${question.id}`} className="group">
                  <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                    {question.title}
                  </h2>
                </Link>

                <p className="text-gray-600 leading-relaxed">{question.body}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => sendReaction(question.id, "like")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold transition-colors duration-200
                      ${
                        reaction.userReaction === "like"
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                      }
                    `}
                    aria-label="Like"
                    title="Like"
                  >
                    👍 <span>{reaction.likeCount}</span>
                  </button>

                  <button
                    onClick={() => sendReaction(question.id, "dislike")}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-semibold transition-colors duration-200
                      ${
                        reaction.userReaction === "dislike"
                          ? "bg-red-600 text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700"
                      }
                    `}
                    aria-label="Dislike"
                    title="Dislike"
                  >
                    👎 <span>{reaction.dislikeCount}</span>
                  </button>

                  <button
                    className="text-gray-500 hover:text-blue-500 transition-colors duration-200 flex items-center gap-1"
                    disabled
                  >
                    <FaComment className="w-4 h-4" />
                    <span className="text-sm">{question.answer_count}</span>
                  </button>
                </div>
              </div>
            </div>
            <Chatbot />
          </div>
        );
      })}
    </div>
  );
}
