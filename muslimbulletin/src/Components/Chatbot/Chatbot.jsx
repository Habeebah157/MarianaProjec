import { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === "") return;

    // Add user message
    setMessages((prev) => [...prev, { text: inputValue, sender: "user" }]);

    const question = inputValue;
    setInputValue("");

    try {
      const res = await fetch("http://localhost:9000/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      // Add bot response
      setMessages((prev) => [...prev, { text: data.response, sender: "bot" }]);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", sender: "bot" },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-400 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-2xl hover:scale-110"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col border border-blue-200">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">Blue Buddy</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-blue-50">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-blue-300 shadow-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-blue-200 p-3 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 border border-blue-300 rounded-l-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition duration-200 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
