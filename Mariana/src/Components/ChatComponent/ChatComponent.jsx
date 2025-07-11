import React, { useState, useEffect, useRef } from "react";

const ChatComponent = ({ socket, userId, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch chat history
  useEffect(() => {
    if (!userId || !receiverId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:9000/messages/${userId}/${receiverId}`);
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    fetchMessages();
  }, [userId, receiverId]);

  // Receive real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const messageData = {
      senderId: userId,
      receiverId: receiverId,
      content: newMessage.trim(),
    };

    socket.emit("send_message", messageData);

    // Optimistically add
    setMessages((prev) => [
      ...prev,
      { ...messageData, sent_at: new Date().toISOString(), id: Date.now() },
    ]);

    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[32rem] w-full max-w-2xl mx-auto border border-gray-300 rounded-xl overflow-hidden shadow-md bg-white">
      {/* Message area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.length === 0 && (
          <p className="text-center text-gray-400">No messages yet</p>
        )}

        {messages.map((msg, i) => {
          const isSender = msg.senderId === userId;

          return (
            <div
              key={msg.id || i}
              className={`flex items-end ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg shadow-sm relative ${
                  isSender
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border"
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
                <span className={`text-xs absolute -bottom-5 right-0 ${isSender ? "text-gray-200" : "text-gray-500"}`}>
                  {new Date(msg.sent_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3 flex items-center gap-3">
        <textarea
          rows={1}
          className="flex-grow resize-none border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg shadow transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
