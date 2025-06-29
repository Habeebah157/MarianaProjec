import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";

export default function QuestionPanel() {
  const { number } = useParams();
  const [question, setQuestion] = useState([]);
  const [canEdit, setCanEdit] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [body, setBody] = useState("");
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this?")) return;

      const response = await fetch(
        `http://localhost:9000/questions/${number}`,
        {
          method: "DELETE",
          headers: {
            token: localStorage.token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      navigate(`/question/`);
    } catch (err) {
      console.log(err);
      alert("Deletion failed");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.token;
      const decoded = jwtDecode(token);
      const { user_name, id } = decoded.user;

      const requestBody = { body: body, question_id: number };
      const res = await fetch(`http://localhost:9000/answers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify(requestBody),
      });

      const newAnswer = await res.json();

      const completeAnswer = {
        ...newAnswer,
        user_name: user_name,
        user_id: id,
        canDelete: true,
      };

      setAnswers((prev) => [completeAnswer, ...prev]);
      setBody("");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this answer?"))
        return;

      const response = await fetch(
        `http://localhost:9000/answers/${answerId}`,
        {
          method: "DELETE",
          headers: {
            token: localStorage.token,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      setAnswers(answers.filter((answer) => answer.id !== answerId));
    } catch (err) {
      console.log(err);
      alert("Failed to delete answer");
    }
  };

  const appendToComment = (text) => {
    setBody((prev) => (prev ? prev + " " + text : text));
  };

  useEffect(() => {
    const uploadQuestionAndAnswers = async () => {
      try {
        const res = await fetch(`http://localhost:9000/questions/${number}`, {
          method: "GET",
          headers: { token: localStorage.token },
        });

        if (!res.ok) throw new Error(`Question fetch failed: ${res.status}`);

        const getQuestion = await res.json();
        if (getQuestion?.question) {
          setQuestion(getQuestion.question);
          setCanEdit(getQuestion.permissions?.canEdit || false);
        } else {
          setQuestion(null);
          setCanEdit(false);
        }
      } catch (err) {
        console.error("Error fetching question:", err);
        setQuestion(null);
        setCanEdit(false);
      }

      try {
        const commentaries = await fetch(
          `http://localhost:9000/answers/question/${number}`,
          {
            method: "GET",
            headers: { token: localStorage.token },
          },
        );

        if (!commentaries.ok)
          throw new Error(`Answer fetch failed: ${commentaries.status}`);

        const getAnswers = await commentaries.json();
        setAnswers(getAnswers?.answers || []);
      } catch (err) {
        console.error("Error fetching answers:", err);
        setAnswers([]);
      }
    };

    uploadQuestionAndAnswers();
  }, [number]);

  return (
    <div className="mx-4 md:mx-10 my-4">
      {/* Back button */}
      <div>
        <a
          href="/question"
          className="inline-flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </a>
      </div>

      {/* Question */}
      <div className="flex items-center gap-2 mt-4">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(question.user_name)}&background=random`}
          alt="User profile"
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
        <Link to={`/profile/${question.user_name}`} className="hover:underline">
          <h5 className="text-sm font-medium">{question.user_name}</h5>
        </Link>
      </div>

      <div className="mt-4">
        <div className="flex flex-row justify-between items-center">
          <p className="text-3xl font-bold">{question.title}</p>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/questions/${number}/edit`, {
                    state: {
                      fromtitle: question.title,
                      frombody: question.body,
                    },
                  })
                }
                aria-label="Edit question"
              >
                <FiEdit
                  size={20}
                  className="text-blue-600 hover:text-blue-800"
                />
              </button>
              <button onClick={handleDelete} aria-label="Delete Question">
                <FiTrash
                  size={20}
                  className="text-red-600 hover:text-red-800"
                />
              </button>
            </div>
          )}
        </div>
        <p className="mt-2">{question.body}</p>
      </div>

      {/* Islamic Shortcut Buttons */}
      <div className="mt-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              arabic: "السلام عليكم ورحمة الله",
              english: "Peace be upon you",
              bg: "bg-green-200 hover:bg-green-300",
            },
            {
              arabic: "الحمد لله",
              english: "All praise is due to Allah",
              bg: "bg-yellow-200 hover:bg-yellow-300",
            },
            {
              arabic: "سبحان الله",
              english: "Glory be to Allah",
              bg: "bg-blue-200 hover:bg-blue-300",
            },
            {
              arabic: "ما شاء الله",
              english: "As Allah has willed",
              bg: "bg-purple-200 hover:bg-purple-300",
            },
            {
              arabic: "إن شاء الله",
              english: "If Allah wills",
              bg: "bg-pink-200 hover:bg-pink-300",
            },
            {
              arabic: "أستغفر الله",
              english: "I seek forgiveness from Allah",
              bg: "bg-red-200 hover:bg-red-300",
            },
          ].map(({ arabic, english, bg }, idx) => (
            <div key={idx} className="text-center group">
              <button
                onClick={() => appendToComment(arabic)}
                className={`w-full px-3 py-2 rounded shadow-md transition-all duration-200 ${bg}`}
                title={english}
              >
                <span className="text-lg font-semibold">{arabic}</span>
              </button>
              <div className="text-xs mt-1 text-gray-600 group-hover:text-black transition-colors">
                {english}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comment Box */}
      <div className="flex flex-col">
        <textarea
          className="border rounded p-3 w-full min-h-[150px] shadow-inner"
          placeholder="Únete a la conversación"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex flex-row-reverse gap-2 items-center justify-end ml-auto mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enviar
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={() => setBody("")}
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4 mt-6">
        {answers.map((answer, index) => {
          const initials = answer.user_name
            ?.split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={index}
              className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {initials}
              </div>

              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-800">
                  {answer.user_name}
                </div>
                <div className="text-gray-600 mt-1 text-sm">{answer.body}</div>
              </div>

              {answer.canDelete && (
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => handleDeleteAnswer(answer.id)}
                  aria-label="Delete answer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
