import { useEffect, useRef, useState } from "react";
import axios from "axios";

const AIShopAssistant = ({ products = [] }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm your EasyShop AI Assistant. Ask me about products, prices, or recommendations.",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const currentMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: currentMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/chat`,
        {
          message: currentMessage,
          products,
        },
        {
          withCredentials:true,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            res.data.reply ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Sorry, AI is currently unavailable.",
        },
      ]);
    }

    setLoading(false);
  };

  const suggestions = [
    "Best mobiles under ₹20,000",
    "Show me running shoes",
    "Recommend a laptop",
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-full shadow-xl transition z-50"
      >
         AI Help
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-[90vw] max-w-sm bg-white border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">

          {/* Header */}
          <div className="bg-black text-white p-4 font-semibold flex justify-between items-center">
            <span>EasyShop AI Assistant</span>

            <button
              onClick={() => setOpen(false)}
              className="text-lg"
            >
              ✖
            </button>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 p-3 border-b">
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => setMessage(item)}
                className="text-xs bg-gray-100 hover:bg-yellow-200 px-3 py-1 rounded-full transition"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 h-80 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-yellow-400 text-black"
                      : "bg-white border"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-sm text-gray-500 italic animate-pulse">
                AI is typing...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={message}
              disabled={loading}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder="Ask about products..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 px-4 rounded-lg disabled:opacity-50 transition"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIShopAssistant;