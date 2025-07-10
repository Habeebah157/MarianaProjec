import React from "react";
import ChatComponent from "../ChatComponent/ChatComponent";

const Messages = () => {
  const loggedInUserId = "550e8400-e29b-41d4-a716-446655440000";
  const receiverId = "d4e5f678-90ab-4cde-1234-567890abcdef"; // Or dynamic based on user selection

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
