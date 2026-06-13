"use client";

import { useState } from "react";
import { voiceQuery } from "@/services/api";

export default function VoiceBox() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await voiceQuery(query.trim());
      setAnswer(res.answer);

      // Browser Web Speech API
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(res.answer);
        u.lang = "en-IN";
        u.rate = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(u);
      }
    } catch {
      setError("Could not get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#0A0A0A]">Ask Khetwise</span>
        <span className="text-xs text-[#A3A3A3]">Voice assistant</span>
      </div>

      {/* Input row */}
      <div className="flex gap-2">
        <input
          id="voice-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Should I irrigate today?"
          className="flex-1 px-3 py-2 text-sm border border-[#E5E5E5] rounded-md text-[#0A0A0A] placeholder-[#A3A3A3] focus:outline-none focus:border-[#D4D4D4] transition-colors duration-150"
        />
        <button
          id="voice-send-btn"
          onClick={handleSend}
          disabled={loading || !query.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-[#FF5722] rounded-md hover:bg-[#E64A19] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>

      {/* Answer */}
      {answer && (
        <div className="mt-4 p-3 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md">
          <p className="text-sm text-[#0A0A0A] leading-relaxed">{answer}</p>
          <p className="text-xs text-[#A3A3A3] mt-2">🔊 Reading aloud…</p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-[#EF4444]">{error}</p>
      )}
    </div>
  );
}
