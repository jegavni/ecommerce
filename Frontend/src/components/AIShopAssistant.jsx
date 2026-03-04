import { useState } from "react";
import axios from "axios";

const AIShopAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi 👋 I can help you find products!" }
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/chat`,
        { message }
      );

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: res.data.reply }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠️ AI not available" }
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-black text-white px-4 py-3 rounded-full shadow-lg"
      >
        🤖 AI Help
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 bg-white rounded-xl shadow-xl border flex flex-col">
          
          <div className="p-3 border-b font-semibold">
            Shopping Assistant
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 h-80">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded text-sm ${
                  msg.role === "user"
                    ? "bg-yellow-100 text-right"
                    : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-xs">Typing...</div>}
          </div>

          <div className="p-2 flex gap-2 border-t">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about products..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-yellow-400 px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIShopAssistant;