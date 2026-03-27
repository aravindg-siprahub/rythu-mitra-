import React, { useRef } from "react";
import "./AIAgent.css";
import { motion, AnimatePresence } from "framer-motion";
import { useAI } from "../context/AIContext";

export default function AIAgent() {
  const {
    isOpen,
    toggleAI,
    messages,
    simulateResponse,
    isListening,
    setIsListening
  } = useAI();

  const inputRef = useRef();
  let recognition;

  /* ================================
        MICROPHONE ENGINE
  =================================*/
  const startListening = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.start();
      setIsListening(true);

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        simulateResponse(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
    } catch (err) {
      alert("Your browser doesn't support voice input.");
    }
  };

  /* ================================
          SEND TEXT INPUT
  =================================*/
  const handleSend = () => {
    const text = inputRef.current.value;
    if (!text) return;

    simulateResponse(text);
    inputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ai-window"
          initial={{ opacity: 0, scale: 0.7, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 40 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ zIndex: 9999 }}
        >
          <div className="ai-header">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Neural Link v2035</span>
            </div>
            <button className="text-white/40 hover:text-white transition-colors" onClick={() => toggleAI(false)}>✕</button>
          </div>

          {/* CHAT BODY */}
          <div className="ai-body scrollbar-hide">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`msg ${msg.sender === "user" ? "user-msg" : "ai-msg shadow-lg shadow-blue-500/5"}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="ai-input-box border-t border-white/5 bg-black/40 backdrop-blur-3xl p-4">
            <input
              ref={inputRef}
              placeholder="Transmit query..."
              className="bg-transparent text-[10px] font-bold text-white uppercase tracking-widest outline-none flex-1 placeholder:text-white/20"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <div className="flex items-center gap-2 ml-4">
              <button
                className={`h-8 w-8 flex items-center justify-center rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}
                onClick={startListening}
              >
                🎤
              </button>
              <button
                onClick={handleSend}
                className="h-8 w-8 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                ➤
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
