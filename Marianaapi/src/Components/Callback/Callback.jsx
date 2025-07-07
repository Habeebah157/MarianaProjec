// In your callback page (e.g., Callback.jsx)
import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Send code to backend
      axios
        .post("http://localhost:9000/api/google/callback", {
          code: code,
          redirect_uri: "http://localhost:5173/callback", // Must match EXACTLY
        })
        .then((response) => {
          // Save user data to state/context/localStorage
          console.log(response.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("events", JSON.stringify(response.data.events));

          // Redirect to dashboard/home
          navigate("/dashboard");
        })
        .catch((error) => {
          console.error("Login failed:", error);
          navigate("/login"); // Redirect back if error
        });
    }
  }, []);

  return <div>Loading...</div>;
}
export default Callback;
