"use client";

import { useState, useRef, useCallback } from "react";
import { voiceQuery } from "@/services/api";
import { t } from "@/lib/i18n";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

// ── Mic icon ──────────────────────────────────────────────────────────────────

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VoiceBox({ language = "en" }: { language?: string }) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Language code → BCP-47 for Web Speech API
  const bcp47: Record<string, string> = {
    en: "en-IN",
    hi: "hi-IN",
    te: "te-IN",
    ta: "ta-IN",
    bn: "bn-IN",
    mr: "mr-IN",
  };
  const speechLang = bcp47[language] ?? "en-IN";

  // ── STT: manual click to start/stop ──────────────────────────────────────

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      return;
    }

    const rec: SpeechRecognitionInstance = new SpeechRecognition();
    rec.lang = speechLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    rec.onerror = () => {
      setListening(false);
      setError("Could not understand. Please try again.");
    };

    rec.onend = () => {
      setListening(false);
    };

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
    setError(null);
  }, [listening, speechLang]);

  // ── TTS: manual click to speak ────────────────────────────────────────────

  const speakAnswer = useCallback(() => {
    if (!answer) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setError("Text-to-speech is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer);
    utterance.lang = speechLang;
    utterance.rate = 0.88;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [answer, speechLang]);

  // ── Send query ─────────────────────────────────────────────────────────────

  async function handleSend() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setIsSpeaking(false);
    try {
      const res = await voiceQuery(query.trim(), language);
      setAnswer(res.answer);
      // ↑ No auto-play TTS — user must click speaker icon
    } catch {
      setError(t(language, "analysis_failed"));
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
    <div
      className="card-elevated animate-slide-up"
      style={{ animationDelay: "120ms" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--accent-light)",
            border: "1px solid #FDE68A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🤖
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>
            {t(language, "ask_khetwise")}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {t(language, "ask_anything")}
          </p>
        </div>
      </div>

      {/* Input row */}
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        {/* Mic button */}
        <button
          id="stt-mic-btn"
          onClick={toggleListening}
          title={listening ? "Stop listening" : "Speak your question"}
          style={{
            width: 42,
            height: 42,
            borderRadius: "var(--radius-sm)",
            border: listening ? "1.5px solid var(--danger)" : "1.5px solid var(--border)",
            background: listening ? "var(--danger-bg)" : "var(--bg)",
            color: listening ? "var(--danger)" : "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 150ms ease",
            position: "relative",
          }}
        >
          {/* Pulse ring when listening */}
          {listening && (
            <span
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: "calc(var(--radius-sm) + 4px)",
                border: "2px solid var(--danger)",
                animation: "pulse-ring 1.4s cubic-bezier(0.215,0.61,0.355,1) infinite",
                opacity: 0.5,
              }}
            />
          )}
          <MicIcon listening={listening} />
        </button>

        {/* Text input */}
        <input
          id="voice-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={listening ? t(language, "voice_listening") : t(language, "voice_placeholder")}
          className="input"
          style={{ flex: 1, height: 42 }}
          disabled={loading}
        />

        {/* Send button */}
        <button
          id="voice-send-btn"
          onClick={handleSend}
          disabled={loading || !query.trim()}
          className="btn-primary"
          style={{ height: 42, padding: "0 18px", flexShrink: 0 }}
        >
          {loading ? (
            <span style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", display: "inline-block", animation: "spin-slow 0.8s linear infinite" }} />
          ) : (
            t(language, "voice_ask")
          )}
        </button>
      </div>

      {/* Listening indicator */}
      {listening && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
            borderRadius: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--danger)",
              display: "inline-block",
              animation: "pulse-ring 1.2s ease infinite",
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--danger)" }}>
            {t(language, "voice_listening_now")}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--danger)",
            padding: "8px 12px",
            background: "var(--danger-bg)",
            borderRadius: 8,
            border: "1px solid var(--danger-border)",
          }}
        >
          {error}
        </p>
      )}

      {/* Answer */}
      {answer && (
        <div
          className="animate-slide-up"
          style={{
            marginTop: 14,
            padding: "14px 16px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, marginBottom: 12 }}>
            {answer}
          </p>

          {/* TTS: manual speak button */}
          <button
            id="tts-speak-btn"
            onClick={speakAnswer}
            title="Read answer aloud"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: isSpeaking ? "var(--accent-hover)" : "var(--text-muted)",
              background: isSpeaking ? "var(--accent-light)" : "transparent",
              border: "1px solid",
              borderColor: isSpeaking ? "var(--accent)" : "var(--border)",
              borderRadius: 999,
              padding: "4px 10px",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <SpeakerIcon />
            {isSpeaking ? t(language, "voice_speaking") : t(language, "voice_read_aloud")}
          </button>
        </div>
      )}
    </div>
  );
}
