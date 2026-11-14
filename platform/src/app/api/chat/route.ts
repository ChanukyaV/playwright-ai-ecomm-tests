import { NextRequest, NextResponse } from "next/server";
import { ChatMessage, ChatRequestBody } from "@/lib/types";
import { PRODUCTS } from "@/lib/products";
import { getCategories } from "@/lib/catalog";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite";
const GEMINI_BASE_URL =
  process.env.GEMINI_BASE_URL ??
  "https://generativelanguage.googleapis.com/v1beta";

function buildSystemPrompt(): string {
  // Compact lines (no long descriptions) keep the prompt small with 100 products.
  const catalog = getCategories(PRODUCTS)
    .map(({ name, count }) => {
      const lines = PRODUCTS.filter((p) => p.category === name).map(
        (p) =>
          `  - ${p.name} (id: ${p.id}, $${p.price.toFixed(2)}, ${
            p.stock > 0 ? `${p.stock} in stock` : "out of stock"
          }, rating ${p.rating}/5)`
      );
      return `${name} (${count} products):\n${lines.join("\n")}`;
    })
    .join("\n");

  return `You are a helpful e-commerce assistant for ShopLab. Help customers find products and provide shopping advice. Be concise and friendly.

STRICT RULES:
- ONLY recommend or mention products from the catalog below. Never invent products, categories, prices, or stock levels.
- If the customer asks for something not in the catalog (e.g. clothing, shoes, furniture), say plainly that ShopLab does not carry it, and suggest the closest catalog items if any.
- You have no access to order data, so do not make up order statuses; tell the customer you can't look up orders.
- When listing products, use the exact names and prices below.

PRODUCT CATALOG (this is the complete inventory, ${PRODUCTS.length} products, grouped by category):
${catalog}`;
}

const GEMINI_TIMEOUT_MS = 20_000;

function friendlyGeminiError(status: number): string {
  switch (status) {
    case 503:
      return "Failed to connect to Gemini: the service is temporarily overloaded or unavailable. Please try again in a moment.";
    case 404:
      return `Gemini model "${GEMINI_MODEL}" was not found. Check the GEMINI_MODEL setting.`;
    case 429:
      return "Gemini rate limit reached. Please wait a bit and try again.";
    case 400:
    case 401:
    case 403:
      return "Gemini rejected the request. Check that GEMINI_API_KEY is valid and has access to the configured model.";
    default:
      return `Gemini returned an unexpected error (HTTP ${status}). Please try again.`;
  }
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequestBody;
  const { message, history = [] } = body;

  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Failed to connect to Gemini: GEMINI_API_KEY is not configured" },
      { status: 503 }
    );
  }

  const contents: GeminiContent[] = [
    ...history.map((m) => ({
      role: (m.role === "assistant" ? "model" : "user") as "user" | "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildSystemPrompt() }] },
          contents,
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API ${response.status}: ${errorText}`);
      return NextResponse.json(
        { error: friendlyGeminiError(response.status) },
        { status: response.status }
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text ?? "")
      .join("");
    const reply: ChatMessage = {
      role: "assistant",
      content: text || "No response from model.",
    };

    return NextResponse.json({ reply });
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    const msg = isTimeout
      ? `request timed out after ${GEMINI_TIMEOUT_MS / 1000} seconds. Please try again.`
      : err instanceof Error
        ? err.message
        : "Unknown error";
    return NextResponse.json(
      { error: `Failed to connect to Gemini: ${msg}` },
      { status: 503 }
    );
  }
}
