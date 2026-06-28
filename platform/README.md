# ShopLab — E-Commerce Testing Playground

A **Next.js 16 (App Router + TypeScript + Tailwind)** application that acts as a System Under Test (SUT) for:

- Playwright UI testing
- Playwright API testing
- AI / LLM testing (Ollama)
- K6 performance testing

---

## Features

| Feature | Details |
|---------|---------|
| Product listing | 8 hardcoded products, grid layout |
| Product detail | Description, price, stock, Add to Cart |
| Shopping cart | Quantity controls, remove, clear, total |
| AI chatbot | Ollama-backed assistant, streaming-free |
| REST APIs | Products, cart, chat — all JSON |
| `data-testid` | On every interactive UI element |
| In-memory cart | Global singleton `Map`, survives hot reloads |

---

## Local Development

### 1 — Prerequisites

- Node.js 20+
- (Optional) [Ollama](https://ollama.com) for the AI chatbot

### 2 — Install dependencies

```bash
cd platform
npm install
```

### 3 — Configure environment (optional — only needed for chat)

```bash
cp .env.local.example .env.local
# Edit .env.local and set OLLAMA_BASE_URL and OLLAMA_MODEL
```

Pull a model for Ollama:

```bash
ollama pull llama3.2
```

### 4 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/products`.

### 5 — Type-check

```bash
npx tsc --noEmit
```

---

## REST API Reference

### Products

```
GET  /api/products          → Product[]
GET  /api/products/:id      → Product | 404
```

### Cart

```
GET    /api/cart                    → { items: CartItem[], total: number }
POST   /api/cart                    → CartItem (201)   body: { productId, quantity? }
DELETE /api/cart                    → clears entire cart
PATCH  /api/cart/:productId         → updated CartItem  body: { quantity }
DELETE /api/cart/:productId         → removes item
```

### Chat

```
POST /api/chat    body: { message: string, history?: ChatMessage[] }
                  → { reply: ChatMessage } | { error: string }
```

---

## Deploying to Google Cloud Run

### Prerequisites

```bash
# Install Google Cloud SDK — https://cloud.google.com/sdk/docs/install
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 1 — Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### 2 — Create an Artifact Registry repository

```bash
gcloud artifacts repositories create shoplab \
  --repository-format=docker \
  --location=us-central1 \
  --description="ShopLab SUT images"
```

### 3 — Build and push the Docker image

```bash
# Authenticate Docker with Google Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

IMAGE=us-central1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/platform:latest

# Option A — local Docker
docker build -t $IMAGE .
docker push $IMAGE

# Option B — Cloud Build (no local Docker required)
gcloud builds submit --tag $IMAGE .
```

### 4 — Deploy to Cloud Run

```bash
gcloud run deploy shoplab-platform \
  --image $IMAGE \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars OLLAMA_BASE_URL=https://YOUR_OLLAMA_HOST,OLLAMA_MODEL=llama3.2
```

Cloud Run will output a service URL like:
`https://shoplab-platform-xxxx-uc.a.run.app`

### 5 — Update environment variables without redeploying

```bash
gcloud run services update shoplab-platform \
  --region us-central1 \
  --set-env-vars OLLAMA_BASE_URL=https://NEW_HOST,OLLAMA_MODEL=llama3.2
```

### 6 — Verify the deployment

```bash
# Get the service URL
gcloud run services describe shoplab-platform \
  --region us-central1 \
  --format="value(status.url)"

# Smoke-test the APIs
curl https://YOUR_SERVICE_URL/api/products | jq length     # → 8
curl https://YOUR_SERVICE_URL/api/cart                     # → { items: [], total: 0 }

curl -X POST https://YOUR_SERVICE_URL/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":1}'
```

---

## Ollama on Cloud Run

Cloud Run containers cannot reach `localhost:11434`. Use one of these options:

| Option | Notes |
|--------|-------|
| **Separate Cloud Run service** | Deploy an Ollama container as a second service (requires a GPU-enabled region); set `OLLAMA_BASE_URL` to its service URL |
| **GCE VM with GPU** | Run `ollama serve` on a Compute Engine VM; connect via VPC with an internal IP |
| **Vertex AI / Gemini** | Replace the `/api/chat` route to call Vertex AI — no Ollama needed |

Without Ollama the chatbot page shows a connection error; all other pages and APIs continue to work normally.

---

## Project Structure

```
platform/
├── Dockerfile
├── .dockerignore
├── .env.local.example
├── next.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx              Root layout + Navbar
│   │   ├── page.tsx                Redirects → /products
│   │   ├── products/
│   │   │   ├── page.tsx            Product listing (server component)
│   │   │   └── [id]/page.tsx       Product detail (server component)
│   │   ├── cart/page.tsx           Shopping cart (client component)
│   │   ├── chat/page.tsx           AI chatbot (client component)
│   │   └── api/
│   │       ├── products/route.ts
│   │       ├── products/[id]/route.ts
│   │       ├── cart/route.ts
│   │       ├── cart/[productId]/route.ts
│   │       └── chat/route.ts
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProductCard.tsx
│   │   └── AddToCartButton.tsx
│   └── lib/
│       ├── types.ts                Shared TypeScript interfaces
│       ├── products.ts             8 hardcoded products
│       └── cart-store.ts           In-memory cart (global Map)
```
