import { useEffect, useRef, useState } from "react";
import { sendChatMessage, type ChatMessage } from "@/llm";
import { ReportContent } from "./ReportContent";

interface ChatbotProps {
  className?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const container = messagesEndRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, loading]);

  const handleNewChat = () => {
    setMessages([]);
    setErrorMessage("");
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = { sender: "user", text: message };
    setMessages([userMessage]);
    setMessage("");
    setLoading(true);
    setErrorMessage("");

    try {
      const reply = await sendChatMessage(userMessage.text);
      setMessages([userMessage, { sender: "bot", text: reply }]);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Could not fetch response.";
      setErrorMessage(text);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {isOpen ? (
        <div className="w-[min(640px,92vw)] h-[min(820px,88vh)] bg-[#29323c] border border-gray-700 shadow-2xl rounded-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-[#242730]">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold text-lg">RPF AI</span>
              {messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="text-sm text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded hover:bg-gray-700/50"
                >
                  محادثة جديدة
                </button>
              )}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar"
            style={{ "--scrollbar-bg": "#29323c" } as React.CSSProperties}
            ref={messagesEndRef}
          >
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <h2 className="text-2xl text-gray-200 font-semibold mb-2" dir="rtl">
                  كيف يمكنني مساعدتك؟
                </h2>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col">
                {msg.sender === "user" ? (
                  <>
                    <div className="text-sm mb-1.5 text-right text-gray-400" dir="rtl">
                      أنت
                    </div>
                    <div
                      className="rounded-xl px-4 py-3 text-white bg-[#1FBAD6] self-end max-w-[85%] text-[15px] leading-relaxed"
                      dir="rtl"
                    >
                      {msg.text}
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-gray-700 bg-[#1e2128] p-5 w-full">
                    <div className="text-xs uppercase tracking-wide text-cyan-500/80 mb-4 font-medium" dir="rtl">
                      تقرير تحليلي
                    </div>
                    <ReportContent content={msg.text} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="rounded-xl border border-gray-700 bg-[#1e2128] p-5">
                <div className="text-xs uppercase tracking-wide text-cyan-500/80 mb-3 font-medium" dir="rtl">
                  جاري إعداد التقرير...
                </div>
                <div className="flex items-center gap-2 text-gray-400" dir="rtl">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="text-red-400 text-sm mt-1 px-1" dir="rtl">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 bg-[#242730]">
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا..."
                disabled={loading}
                rows={2}
                dir="rtl"
                className="w-full bg-[#1e2128] text-white rounded-lg py-3 px-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 text-[15px] leading-relaxed"
              />
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="absolute left-3 bottom-3 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white rounded-full p-4 shadow-lg"
          aria-label="Open RPF AI"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
