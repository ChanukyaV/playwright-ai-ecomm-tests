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

### 🎯 Goal

Deploy ShopLab as a Docker image to Google Cloud Run using Artifact Registry.

### 🧱 Architecture

```
Local Code → Docker Build → Artifact Registry → Cloud Run
```

---

### Step 1 — Prepare the project

Ensure `next.config.ts` has standalone output (already set):

```ts
const nextConfig: NextConfig = {
  output: "standalone",
};
```

Verify the build works locally before touching Docker:

```bash
npm install
npm run build
```

---

### Step 2 — Build and validate Docker locally

```bash
# Build
docker build -t shoplab-platform .

# Run locally to validate (visit http://localhost:8080)
docker run -p 8080:8080 shoplab-platform
```

---

### Step 3 — Enable Google Cloud APIs

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

### Step 4 — Create Artifact Registry repository

```bash
gcloud artifacts repositories create shoplab \
  --repository-format=docker \
  --location=asia-south1
```

---

### Step 5 — Authenticate Docker

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

### Step 6 — Tag the image

```bash
docker tag shoplab-platform \
  asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform
```

---

### Step 7 — Push to Artifact Registry

```bash
docker push \
  asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform
```

> **Alternative — Cloud Build (no local Docker push required):**
> ```bash
> gcloud builds submit \
>   --tag asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform .
> ```

---

### Step 8 — Deploy to Cloud Run

```bash
gcloud run deploy shoplab-platform \
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform \
  --region asia-south1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars OLLAMA_BASE_URL=https://YOUR_OLLAMA_HOST,OLLAMA_MODEL=llama3.2
```

You'll get a service URL:

```
https://shoplab-platform-xxxx-em.a.run.app
```

---

### Step 9 — Environment variables

Set or update env vars in Cloud Run without rebuilding the image:

```bash
gcloud run services update shoplab-platform \
  --region asia-south1 \
  --set-env-vars \
    OLLAMA_BASE_URL=https://YOUR_OLLAMA_HOST,\
    OLLAMA_MODEL=llama3.2
```

Or via **Cloud Console → Cloud Run → shoplab-platform → Edit & Deploy New Revision → Variables & Secrets**.

---

### Step 10 — Verify the deployment

```bash
# Get the service URL
gcloud run services describe shoplab-platform \
  --region asia-south1 \
  --format="value(status.url)"

# Smoke-test the APIs
curl https://YOUR_SERVICE_URL/api/products | jq length     # → 8
curl https://YOUR_SERVICE_URL/api/cart                     # → { items: [], total: 0 }

curl -X POST https://YOUR_SERVICE_URL/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":1}'
```

---

### 🔄 Future deployment workflow

Every time you push new code, run this to redeploy:

```bash
git pull

gcloud config set project YOUR_PROJECT_ID

gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform .

gcloud run deploy shoplab-platform \
  --image asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform \
  --region asia-south1 \
  --allow-unauthenticated
```

---

### 🗂️ Artifact Registry — image management

#### List images (newest first)

```bash
gcloud artifacts docker images list \
  asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform \
  --include-tags \
  --sort-by="~CREATE_TIME"
```

Keep the top 2 (latest + previous). Delete the rest.

#### Set a cleanup policy (keeps last 2 automatically)

```bash
gcloud artifacts repositories set-cleanup-policies shoplab \
  --location=asia-south1 \
  --policy='[{"name":"keep-latest","action":{"type":"Keep"},"mostRecentVersions":{"keepCount":2}}]'
```

#### Manually delete a specific image

```bash
gcloud artifacts docker images delete \
  asia-south1-docker.pkg.dev/YOUR_PROJECT_ID/shoplab/shoplab-platform@sha256:<DIGEST> \
  --delete-tags --quiet
```

---

### Ollama on Cloud Run

Cloud Run containers cannot reach `localhost:11434`. Use one of these options:

| Option | Notes |
|--------|-------|
| **Separate Cloud Run service** | Deploy an Ollama container as a second service (requires a GPU-enabled region); set `OLLAMA_BASE_URL` to its service URL |
| **GCE VM with GPU** | Run `ollama serve` on a Compute Engine VM; connect via VPC with an internal IP |
| **Vertex AI / Gemini** | Replace the `/api/chat` route to call Vertex AI — no Ollama needed |

Without Ollama the chatbot page shows a connection error; all other pages and APIs work normally.

---

### ⚠️ Key learnings

- Always validate `npm run build` locally before building the Docker image
- Always validate the Docker image locally (`docker run -p 8080:8080`) before pushing
- Avoid `--source` deployment — Docker image-based is more reliable
- `output: "standalone"` in `next.config.ts` is required — without it the container won't start
- IAM issues usually point to the wrong service account — check Cloud Build SA permissions

---

### 💡 Optional improvements

- Custom domain mapping via Cloud Run domain mappings
- CI/CD via Cloud Build triggers on GitHub push
- Cost: set `--min-instances 0` to scale to zero when idle

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
