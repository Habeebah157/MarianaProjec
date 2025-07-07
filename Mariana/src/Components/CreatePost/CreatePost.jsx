import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function CreatePost() {
  const navigate = useNavigate();
  const [inputs, setInputs] = React.useState({ title: "", body: "" });
  const { title, body } = inputs;
  const [similarQuestions, setSimilarQuestions] = React.useState([]);

  const fetchSimilarQuestions = async (query) => {
    if (!query) {
      setSimilarQuestions([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:9000/ai/api/search?query=${encodeURIComponent(query)}&threshold=0.1`,
        { headers: { token: localStorage.token } },
      );
      const data = await response.json();
      setSimilarQuestions(data);
    } catch (err) {
      console.error("Failed to fetch similar questions:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((i) => ({ ...i, [name]: value }));
    if (name === "title") fetchSimilarQuestions(value);
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const postData = { title, body };
      const response = await fetch(`http://localhost:9000/questions/question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify(postData),
      });
      const parseRes = await response.json();
      if (parseRes.success) {
        setInputs({ title: "", body: "" });
        setSimilarQuestions([]);
        navigate("/question");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="m-5 max-w-5xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Column */}
        <div className="flex-1">
          <form onSubmit={onSubmitForm} className="space-y-6">
            <div>
              <Link
                to="/question"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                ← Back
              </Link>
            </div>

            <div>
              <input
                name="title"
                value={title}
                onChange={handleChange}
                className="w-full border p-4 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Title"
                autoComplete="off"
                required
              />
            </div>

            <div>
              <textarea
                name="body"
                value={body}
                onChange={handleChange}
                className="w-full border p-4 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px]"
                placeholder="Write your post or question here..."
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow hover:scale-105 transition"
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Column */}
        <aside className="w-full lg:w-1/3">
          <h3 className="text-xl font-semibold mb-4">Similar Questions</h3>
          {similarQuestions.length === 0 ? (
            <p className="text-gray-500">Type a title to see suggestions…</p>
          ) : (
            <ul className="space-y-2">
              {similarQuestions.map((q) => (
                <li key={q.id}>
                  <Link
                    to={`/question/${q.id}`}
                    className="
                      block
                      p-4
                      bg-gray-50
                      rounded-lg
                      hover:bg-gray-100
                      transition
                      shadow-sm
                      hover:shadow
                    "
                  >
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {q.title}
                    </h3>

                    {/* Body preview */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {q.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
