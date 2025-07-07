import React from "react";
import { toast } from "react-toastify";

export default function Signup({ setAuth }) {
  const [inputs, setInputs] = React.useState({
    user_name: "",
    user_email: "",
    password: "",
    mobile_number: "",
  });
  const { user_email, password, user_name, mobile_number } = inputs;
  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };
  const onSubmitForm = async (e) => {
    e.preventDefault();
    try {
      const body = { user_name, user_email, password, mobile_number };
      const response = await fetch("http://localhost:9000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const parseRes = await response.json();
      console.log(parseRes.token);
      if (parseRes.token) {
        console.log("THIS WORKS YAYA MIGHT BREAK");

        setAuth(true);
        localStorage.setItem("token", parseRes.token);
        toast.success("Register Successfully");
      } else {
        console.log("NOt works");
        setAuth(false);
        toast.error(parseRes);
      }
    } catch (err) {
      console.log(err.message);
    }
  };
  return (
    <div>
      <h1 className="text-3xl font-bold underline text-center mt-10">
        Sign Up
      </h1>
      <form className="flex flex-col items-center mt-5" onSubmit={onSubmitForm}>
        <input
          name="user_name"
          type="text"
          placeholder="Username"
          className="border p-2 mb-4"
          value={inputs.user_name}
          onChange={(e) => handleChange(e)}
        />
        <input
          name="user_email"
          type="user_email"
          placeholder="Email"
          className="border p-2 mb-4"
          value={inputs.user_email}
          onChange={(e) => handleChange(e)}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="border p-2 mb-4"
          value={inputs.password}
          onChange={(e) => handleChange(e)}
        />
        <input
          name="mobile_number"
          type="mobile_number"
          placeholder="Mobile Number"
          className="border p-2 mb-4"
          value={inputs.mobile_number}
          onChange={(e) => handleChange(e)}
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Sign Up
        </button>
      </form>
      <p className="text-center mt-5">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500">
          Login
        </a>
      </p>
      <p className="text-center mt-5">
        By signing up, you agree to our{" "}
        <a href="/terms" className="text-blue-500">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-500">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
