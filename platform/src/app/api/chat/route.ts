import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, ChatRequestBody } from "@/lib/types";

const OLLAMA_BASE_URL =
  process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message?: { role: string; content: string };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequestBody;
  const { message, history = [] } = body;

  const messages: OllamaMessage[] = [
    {
      role: "system",
      content:
        "You are a helpful e-commerce assistant for ShopLab. Help customers find products, answer questions about orders, and provide shopping advice. Be concise and friendly.",
    },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Ollama error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = (await response.json()) as OllamaChatResponse;
    const reply: ChatMessage = {
      role: "assistant",
      content: data.message?.content ?? "No response from model.",
    };

    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to connect to Ollama: ${msg}` },
      { status: 503 }
    );
  }
}
