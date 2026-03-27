import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./AIAssistantWidget.css";

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hi Aravind! Need crop advice, weather update, or disease help? 🌿" }
  ]);
  const [input, setInput] = useState("");

  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated AI response (replace later with backend)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Thanks! I’ll improve this for you. Soon we'll connect advanced AI backend 🚀"
        }
      ]);
    }, 800);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="ai-floating-btn"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setOpen(true)}
      >
        🤖
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-panel"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.85 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div className="ai-header">
              <h3>AI Assistant</h3>
              <button onClick={() => setOpen(false)}>✖</button>
            </div>

            {/* Chat Body */}
            <div className="ai-body">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`ai-msg ${msg.sender === "user" ? "user-msg" : "ai-msg-text"}`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="ai-input-box">
              <input
                type="text"
                placeholder="Ask anything…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={sendMessage}>➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
