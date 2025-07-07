import { useLocation, useNavigate, useParams } from "react-router-dom";
import React, { useEffect } from "react";

export default function EditQuestion() {
  const { number } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { fromtitle = null, frombody = "Anonymous" } = state || {};
  const [inputs, setInputs] = React.useState({
    title: fromtitle,
    body: frombody,
  });
  const { title, body } = inputs;

  const saveQuestion = async () => {
    try {
      const requestBody = { title, body };
      const res = await fetch(`http://localhost:9000/questions/${number}`, {
        method: "PATCH",
        headers: {
          token: localStorage.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const returnjson = await res.json();
      console.log("Success", returnjson);
      if (returnjson.success) {
        alert("Question saved successfully!");
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    saveQuestion();
  }, []);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };
  const onSubmitForm = async (e) => {
    e.preventDefault();
    await saveQuestion();
    navigate(`/question/${number}`);
  };

  return (
    <div className="m-5 max-w-2xl mx-auto">
      <form onSubmit={onSubmitForm} className="space-y-4">
        <div>
          <a
            href="/question"
            className="inline-flex items-center gap-2 p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
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

        <div>
          <input
            name="title"
            value={title}
            onChange={handleChange}
            className="w-full border p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
            placeholder="Title"
            required
          />
        </div>

        <div>
          <textarea
            name="body"
            value={body}
            onChange={handleChange}
            className="
                            w-full
                            border border-gray-300
                            p-4
                            rounded-lg
                            focus:outline-none
                            focus:ring-2 focus:ring-blue-500
                            focus:border-transparent
                            resize-y
                            min-h-[120px]
                            placeholder-gray-400
                            text-gray-700
                        "
            placeholder="Write your post or question here..."
            rows={5}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="
                            relative
                            border-0
                            py-3 px-8
                            bg-gradient-to-r from-blue-600 to-indigo-700
                            text-white
                            font-medium
                            rounded-xl
                            shadow-lg
                            hover:shadow-xl
                            hover:from-blue-500 hover:to-indigo-600
                            transform
                            hover:scale-[1.02]
                            active:scale-100
                            transition-all
                            duration-300
                            ease-out
                            overflow-hidden
                            group
                            w-full sm:w-auto
                        "
          >
            <span
              className="
                            absolute
                            top-0 left-0
                            w-full h-full
                            bg-white/10
                            -translate-x-full
                            group-hover:translate-x-0
                            transition-transform
                            duration-700
                            ease-in-out
                        "
            ></span>
            <span className="relative tracking-wide">Submit</span>
          </button>
        </div>
      </form>
    </div>
  );
}
