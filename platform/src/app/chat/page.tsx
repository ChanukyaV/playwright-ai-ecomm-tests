"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/lib/types";

interface ChatApiResponse {
  reply?: ChatMessage;
  error?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = (await res.json()) as ChatApiResponse;

      if (!res.ok || !data.reply) {
        setError(data.error ?? "Failed to get a response. Is Ollama running?");
        return;
      }

      setMessages([...updatedHistory, data.reply]);
    } catch {
      setError("Could not connect to the chat service.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <main
      className="max-w-3xl mx-auto px-6 py-8 w-full flex flex-col"
      style={{ height: "calc(100vh - 64px)" }}
      data-testid="chat-page"
    >
      <h1
        className="text-2xl font-bold text-gray-900 mb-4 flex-shrink-0"
        data-testid="chat-title"
      >
        AI Shopping Assistant
      </h1>

      <div
        className="flex-1 overflow-y-auto flex flex-col gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4 min-h-0"
        data-testid="chat-messages"
      >
        {messages.length === 0 && !loading && (
          <div
            className="flex-1 flex items-center justify-center"
            data-testid="chat-empty"
          >
            <div className="text-center select-none">
              <p className="text-5xl mb-3">🤖</p>
              <p className="text-gray-500 text-sm">
                Ask me anything about our products or shopping!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`message-${msg.role}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
              }`}
              data-testid="message-bubble"
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start" data-testid="chat-loading">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="text-gray-500 text-sm">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div
          className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex-shrink-0"
          data-testid="chat-error"
        >
          {error}
        </div>
      )}

      <div
        className="flex gap-2 flex-shrink-0"
        data-testid="chat-input-area"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about our products… (Enter to send, Shift+Enter for newline)"
          rows={2}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          data-testid="chat-input"
        />
        <button
          onClick={() => void handleSend()}
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white px-6 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          data-testid="send-message-btn"
        >
          Send
        </button>
      </div>
    </main>
  );
}
