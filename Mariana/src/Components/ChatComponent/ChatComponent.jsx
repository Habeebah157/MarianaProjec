import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { FaCircle, FaMicrophone, FaStop } from "react-icons/fa";

const ChatComponent = ({ userId, business, hasBusiness }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [localBusiness, setLocalBusiness] = useState(null);
  
  useEffect(() => {
    if (hasBusiness && business) {
      setLocalBusiness(business);
      setSelectedUserId(prev => [...prev, business]);
    }
  }, [hasBusiness, business]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:9000/messages/${userId}/conversations`,
          {
            headers: { token: localStorage.token },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
        setError("Failed to load users.");
      }
    };

    fetchUsers();
  }, [userId]);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError("");
      try {
        const res = await fetch(
          `http://localhost:9000/messages/${userId}/${selectedUserId}`,
          {
            headers: { token: localStorage.token },
            signal,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch messages", err);
          setError("Failed to load messages.");
        }
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    return () => controller.abort();
  }, [selectedUserId, userId]);

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io("http://localhost:9000");

    socketRef.current.emit("register", userId);

    socketRef.current.on("receive_message", (message) => {
      if (
        (message.sender_id === selectedUserId && message.receiver_id === userId) ||
        (message.sender_id === userId && message.receiver_id === selectedUserId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socketRef.current.on("message_sent", (message) => {
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
      setSending(false);
    });

    socketRef.current.on("error", (msg) => {
      setError(msg);
      setSending(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [userId, selectedUserId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    setSending(true);
    setError("");

    socketRef.current.emit("send_message", {
      senderId: userId,
      receiverId: selectedUserId,
      content: newMessage.trim(),
    });
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Your browser does not support audio recording.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        await uploadVoiceNote(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setIsRecording(false);
  };

  const uploadVoiceNote = async (blob) => {
    if (blob.size === 0) {
      alert("Recorded audio is empty!");
      return;
    }

    if (!selectedUserId) {
      alert("Select a user to send voice note.");
      return;
    }

    const formData = new FormData();
    formData.append("voiceNote", blob, "voice_note.webm");
    formData.append("receiverId", selectedUserId);

    try {
      setSending(true);
      setError("");

      const res = await fetch(`http://localhost:9000/messages/${userId}/send-voice`, {
        method: "POST",
        headers: {
          token: localStorage.token,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload voice note");
      const message = await res.json();

      setMessages((prev) => [...prev, message]);
    } catch (err) {
      console.error(err);
      setError("Failed to send voice note");
    } finally {
      setSending(false);
    }
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="flex h-[32rem] max-w-4xl mx-auto border rounded shadow bg-white">
      {/* Sidebar */}
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

      {/* Chat area */}
      <div className="flex-grow p-6 flex flex-col">
        {!selectedUser ? (
          <p className="text-gray-400">Select a user to start chatting</p>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">
              Chat with {selectedUser.user_name}
            </h3>

            <div
              className="flex-grow overflow-auto border rounded p-3 mb-4"
              style={{ maxHeight: "18rem" }}
            >
              {error && <div className="text-red-600 mb-2">{error}</div>}
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                messages.map((msg) => {
                  const isSentByLoggedInUser = msg.sender_id === userId;
                  return (
                    <div
                      key={msg.id}
                      className={`my-1 p-2 rounded max-w-xs ${
                        isSentByLoggedInUser ? "bg-blue-200 text-left" : "bg-green-200 text-right"
                      }`}
                      style={{
                        alignSelf: isSentByLoggedInUser ? "flex-start" : "flex-end",
                        marginLeft: isSentByLoggedInUser ? 0 : "auto",
                        marginRight: isSentByLoggedInUser ? "auto" : 0,
                      }}
                    >
                      {msg.type === "voice" ? (
                        <audio controls src={msg.content} />
                      ) : (
                        msg.content
                      )}
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(msg.sent_at).toLocaleTimeString()}
                        {isSentByLoggedInUser ? <span>You</span> : <span>{msg.receiver_id}</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex items-center gap-2">
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

              {/* Mic or Stop icon next to send button */}
              {isRecording ? (
                <FaStop
                  onClick={stopRecording}
                  className="text-red-600 cursor-pointer"
                  size={28}
                  title="Stop Recording"
                  aria-label="Stop Recording"
                />
              ) : (
                <FaMicrophone
                  onClick={startRecording}
                  className="text-green-600 cursor-pointer"
                  size={28}
                  title="Record Voice"
                  aria-label="Record Voice"
                />
              )}

              {/* Blinking red dot when recording */}
              {isRecording && (
                <FaCircle
                  className="animate-pulse text-red-600"
                  title="Recording..."
                  style={{ fontSize: "1rem" }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatComponent;
