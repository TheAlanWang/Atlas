// components/ChatWidget.tsx
"use client";

import { useState, useRef, useEffect } from "react";

type Source = { title: string; slug: string; topic: string };

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about the articles on this site.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    // Add an empty assistant message immediately — will be filled in as stream arrives
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", sources: [] },
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        history: messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") break;

        const parsed = JSON.parse(data);

        setMessages((prev) => {
          const updated = [...prev];
          const last = { ...updated[updated.length - 1] };
          if (parsed.sources) last.sources = parsed.sources;
          if (parsed.text) last.content += parsed.text;
          updated[updated.length - 1] = last;
          return updated;
        });
      }
    }

    setLoading(false);
  }

  return (
    <>
      {/* Floating toggle button — fixed to bottom right corner */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center border-none bg-transparent cursor-pointer p-0 atlas-enter"
      >
        <span aria-hidden="true" className="absolute -inset-[10px] opacity-85" style={{
          background: "conic-gradient(from 0deg, #ff4e6e, #ff9b2e, #ffe135, #4fffb0, #4dc8ff, #a259ff, #ff4e6e)",
          animation: "atlas-spin 5s linear infinite, atlas-blob 5s ease-in-out infinite",
          filter: "blur(14px)",
        }} />
        <span aria-hidden="true" className="absolute -inset-1 opacity-70" style={{
          background: "conic-gradient(from 180deg, #a259ff, #4dc8ff, #4fffb0, #ffe135, #ff9b2e, #ff4e6e, #a259ff)",
          animation: "atlas-spin 3s linear infinite reverse, atlas-blob 4s ease-in-out infinite reverse",
          filter: "blur(6px)",
        }} />
        <span className="relative z-10 text-[22px] text-white" style={{ textShadow: "0 0 12px rgba(0,0,0,0.4)" }}>
          ✦
        </span>
      </button>

      {/* Chat dialog — only rendered when open is true */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 h-[450px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl flex flex-col border border-zinc-200 dark:border-zinc-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
            <span className="font-semibold text-sm">Atlas AI Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-[#007AFF] text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {msg.content ||
                    (loading && i === messages.length - 1 ? "▋" : "")}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Source:{" "}
                      {msg.sources.map((s, i) => (
                        <span key={s.slug}>
                          {i > 0 && ", "}
                          <a
                            href={`/${s.topic}?slug=${s.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-zinc-700 dark:hover:text-zinc-200"
                          >
                            {s.title}
                          </a>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question..."
              className="flex-1 text-sm border border-zinc-300 dark:border-zinc-600 rounded-xl px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            />
            <button
              onClick={send}
              disabled={loading}
              className="bg-[#007AFF] text-white text-sm px-3 py-2 rounded-xl hover:bg-[#0071E3] disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
