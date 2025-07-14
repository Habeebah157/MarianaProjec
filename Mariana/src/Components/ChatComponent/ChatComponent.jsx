import React, { useState, useEffect, useRef } from "react";

const ChatComponent = ({ userId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Fetch users (conversations)
  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:9000/messages/${userId}/conversations`, {
          headers: { token: localStorage.token },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchUsers();
  }, [userId]);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(
          `http://localhost:9000/messages/${userId}/conversation/${selectedUserId}`,
          { headers: { token: localStorage.token } }
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUserId, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle sending new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`http://localhost:9000/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.token,
        },
        body: JSON.stringify({
          senderId: userId,
          receiverId: selectedUserId,
          text: newMessage.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const sentMessage = await res.json();
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="flex h-[32rem] max-w-4xl mx-auto border rounded shadow bg-white">
      {/* Sidebar with user list */}
      <div className="w-1/4 border-r overflow-auto">
        <h2 className="p-4 font-bold border-b">Users</h2>
        {users.length === 0 && <p className="p-4 text-gray-500">No users found</p>}
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => setSelectedUserId(user.id)}
              className={`cursor-pointer p-3 border-b hover:bg-gray-100 ${
                selectedUserId === user.id ? "bg-blue-100 font-semibold" : ""
              }`}
            >
              {user.user_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat tab / content */}
      <div className="flex-grow p-6 flex flex-col">
        {!selectedUser ? (
          <p className="text-gray-400">Select a user to start chatting</p>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">Chat with {selectedUser.user_name}</h3>

            <div
              className="flex-grow overflow-auto border rounded p-3 mb-4"
              style={{ maxHeight: "18rem" }}
            >
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`my-1 p-2 rounded max-w-xs ${
                      msg.senderId === userId ? "bg-green-200 self-end" : "bg-gray-200 self-start"
                    }`}
                    style={{ alignSelf: msg.senderId === userId ? "flex-end" : "flex-start" }}
                  >
                    {msg.text}
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-grow border rounded px-3 py-2"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || newMessage.trim() === ""}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
