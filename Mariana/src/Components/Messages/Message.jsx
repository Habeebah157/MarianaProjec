import React, { useState, useEffect } from "react";
import ChatComponent from "../ChatComponent/ChatComponent";

const Messages = () => {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const receiverId = "d4e5f678-90ab-4cde-1234-567890abcdef"; // Or dynamic

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      console.log(token)
      if (!token) return;

      try {
        const res = await fetch("http://localhost:9000/auth/api/me", {
          headers: { token: localStorage.token },
        });
        if (!res.ok) throw new Error("Failed to fetch user info");

        const data = await res.json();
        console.log(data)
        setLoggedInUserId(data.id);
      } catch (error) {
        console.error(error);
        // Handle errors or redirect to login if needed
      }
    };

    fetchUser();
  }, []);

  if (!loggedInUserId) return <p>Loading user info...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Your Messages</h1>
      <div className="border rounded shadow p-4">
        <ChatComponent userId={loggedInUserId} receiverId={receiverId} />
      </div>
    </div>
  );
};

export default Messages;
