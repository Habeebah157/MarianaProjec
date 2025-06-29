import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function UserProfile() {
  const { userId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notAuthorized, setNotAuthorized] = useState(false); // ✅ fix this

  useEffect(() => {
    async function fetchUserQuestions() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:9000/questions/user/${userId}/questions`,
          {
            headers: {
              token: localStorage.token,
            },
          }
        );

        if (!res.ok) {
          setNotAuthorized(true); // ✅ fix state setter
          throw new Error(`You should not have access to this`);
        }

        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserQuestions();
  }, [userId]);

  // ✅ Handle loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center text-gray-600">
        Loading questions...
      </div>
    );
  }

  // ✅ Show unauthorized screen
  if (notAuthorized) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center text-red-600 font-semibold">
        <h1>Not Authorized</h1>
        <p>Are you the owner of this profile?</p>
      </div>
    );
  }

  // ✅ Show error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

  // ✅ Normal content
  return (
    <div className="max-w-3xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
      {/* Back Button */}
      <button
        onClick={() =>
          (window.location.href = "http://localhost:5174/question")
        }
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        ← Back to Questions
      </button>

      <h1 className="text-4xl font-bold border-b-4 border-blue-600 pb-2 mb-6">
        User Profile
      </h1>
      <h2 className="text-xl text-gray-700 mb-8">
        Questions posted by user: <span className="font-mono">{userId}</span>
      </h2>

      {questions.length === 0 ? (
        <p className="italic text-gray-500">
          No questions found for this user.
        </p>
      ) : (
        <ul className="space-y-6">
          {questions.map((q) => (
            <li
              key={q.id}
              className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <Link
                to={`/question/${q.id}`}
                className="text-2xl text-blue-600 font-semibold hover:underline"
              >
                {q.title}
              </Link>
              <p className="text-gray-700 mt-2 mb-4">{q.body}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>
                  Created at: {new Date(q.created_at).toLocaleDateString()}
                </span>
                <span className="font-semibold text-gray-800">
                  Answers: {q.answer_count}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
