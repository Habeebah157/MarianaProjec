import React from "react";
import { toast } from "react-toastify";

export default function Login({ setAuth }) {
  const [inputs, setInputs] = React.useState({
    user_email: "",
    password: "",
  });
  const { user_email, password } = inputs;
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };
  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { user_email, password };
      const response = await fetch("http://localhost:9000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();
      if (parseRes.jwtToken) {
        setAuth(true);
        localStorage.setItem("token", parseRes.jwtToken);
        toast.success("Logged In");
      } else {
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline text-center mt-10">Login</h1>
      <form className="flex flex-col items-center mt-5" onSubmit={onSubmitForm}>
        <input
          type="email"
          name="user_email"
          placeholder="Email"
          className="border p-2 mb-4"
          value={inputs.user_email}
          onChange={(e) => handleChange(e)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="border p-2 mb-4"
          value={inputs.password}
          onChange={(e) => handleChange(e)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Login
        </button>
      </form>
      <p className="text-center mt-5">
        Don't have an account?{" "}
        <a href="/SignUp" className="text-blue-500">
          Sign Up
        </a>
      </p>
    </div>
  );
}
