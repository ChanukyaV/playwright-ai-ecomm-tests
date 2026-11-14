# ShopLab — E-Commerce Testing Playground

A **Next.js 16 (App Router + TypeScript + Tailwind)** application that acts as a System Under Test (SUT) for:

- Playwright UI testing
- Playwright API testing
- AI / LLM testing (Google Gemini)
- K6 performance testing

---

## Features

| Feature | Details |
|---------|---------|
| Product listing | 100 hardcoded products in 7 categories, grid layout, 12 per page with pagination, category filter and search |
| Product detail | Description, price, stock, Add to Cart |
| Shopping cart | Quantity controls, remove, clear, total |
| AI chatbot | Gemini-backed assistant, streaming-free |
| REST APIs | Products, cart, chat — all JSON |
| `data-testid` | On every interactive UI element |
| In-memory cart | Global singleton `Map`, survives hot reloads |

---

## Local Development

### 1 — Prerequisites

- Node.js 20+
- (Optional) A [Google Gemini API key](https://aistudio.google.com/apikey) for the AI chatbot

### 2 — Install dependencies

```bash
cd platform
npm install
```

### 3 — Configure environment (optional — only needed for chat)

```bash
cp .env.local.example .env.local
# Edit .env.local and set GEMINI_API_KEY (and optionally GEMINI_MODEL)
```

**Getting a Gemini API key**

1. Go to [Google AI Studio → API keys](https://aistudio.google.com/apikey) and sign in with a Google account.
2. Click **Create API key**, pick (or create) a Google Cloud project, and copy the key.
3. Paste it into `platform/.env.local` as `GEMINI_API_KEY=...` and restart `npm run dev`.

The free tier is enough for testing. Never commit the key (`.env.local` is git-ignored).

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
GET  /api/products          → Product[] (all 100; no params)
GET  /api/products?page=1&pageSize=12&category=Audio&q=term
                           → { items, page, pageSize, total, totalPages }  (400 on invalid page/pageSize)
GET  /api/categories        → { name, count }[]
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
Cloud Shell → Cloud Build → Artifact Registry → Cloud Run
```

---

## Step 0 — Get the code onto Cloud Shell

### 0.1 Set up SSH for GitHub (one-time)

Skip this if you already cloned a repo via SSH in Cloud Shell before. Run `cat ~/.ssh/id_ed25519.pub` — if it prints a key, skip to Step 0.2.

```bash
ssh-keygen -t ed25519 -C "mail2chanu@gmail.com"
# Press Enter three times to accept defaults

cat ~/.ssh/id_ed25519.pub
```

Add the output to GitHub:

1. Go to <https://github.com/settings/ssh/new>
2. Title: **Google Cloud Shell**
3. Paste the key → click **Add SSH key**

Test the connection:

```bash
ssh -T git@github.com
# Expected: Hi ChanukyaV! You've successfully authenticated...
```

### 0.2 Clone the repo

```bash
cd ~/home/mail2chanu

git clone git@github.com:ChanukyaV/playwright-ai-ecomm-tests.git
```

If already cloned from a previous session, pull the latest code instead:

```bash
cd ~/home/mail2chanu/playwright-ai-ecomm-tests && git pull
```

---

## Part 1 — One-time GCP Setup

Run these once. If you've already done a step, skip it.

### 1.1 Create a GCP project

```bash
gcloud projects create shoplab-platform-prod --name="shoplab-platform"
gcloud config set project shoplab-platform-prod
gcloud billing projects link shoplab-platform-prod \
  --billing-account=013B3D-799559-F0AAC8
```

### 1.2 Enable required GCP services

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  logging.googleapis.com \
  storage.googleapis.com
```

### 1.3 Create Artifact Registry repository

```bash
gcloud artifacts repositories create shoplab-platform \
  --repository-format=docker \
  --location=asia-south1 \
  --description="shoplab-platform container images"
```

### 1.4 Set cleanup policy (keeps only the last image — stays within free tier)

```bash
cat > /tmp/cleanup-policy.json << 'EOF'
[{"name":"keep-latest","action":{"type":"Keep"},"mostRecentVersions":{"keepCount":1}}]
EOF

gcloud artifacts repositories set-cleanup-policies shoplab-platform \
  --location=asia-south1 \
  --project shoplab-platform-prod \
  --policy=/tmp/cleanup-policy.json
```

### 1.5 Authenticate Docker with Artifact Registry

```bash
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

---

## Part 2 — Build and Deploy

### 2.1 Verify the Dockerfile

The `platform/Dockerfile` uses a two-stage build. Confirm it matches:

```dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
# GEMINI_API_KEY must be supplied at deploy time (never bake it into the image)
ENV GEMINI_MODEL=gemini-3.5-flash-lite

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
```

### 2.2 Verify standalone output in Next.js

`next.config.ts` must have `output: 'standalone'` (already set):

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

### 2.3 Build and push image using Cloud Build

This builds the image entirely inside GCP — no local Docker installation needed. Takes 3–5 minutes.

```bash
cd ~/home/mail2chanu/playwright-ai-ecomm-tests/platform

gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform \
  --region asia-south1
```

You'll see build logs streaming in the terminal.

### 2.4 Deploy to Cloud Run

```bash
gcloud run deploy shoplab-platform \
  --image asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform \
  --region us-east1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --project shoplab-platform-prod
```

When it finishes you'll see a URL like `https://shoplab-platform-xxxx-ue.a.run.app`. Open it in your browser to confirm it works.

---

### Environment variables

Set or update env vars in Cloud Run without rebuilding the image:

```bash
gcloud run services update shoplab-platform \
  --region us-east1 \
  --project shoplab-platform-prod \
  --set-env-vars GEMINI_MODEL=gemini-3.5-flash-lite \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

`gemini-api-key` is a Secret Manager secret holding your key. For a quick test you can instead use `--set-env-vars GEMINI_API_KEY=...`, but a secret is safer.

Or via **Cloud Console → Cloud Run → shoplab-platform → Edit & Deploy New Revision → Variables & Secrets**.

---

### Verify the deployment

```bash
# Get the service URL
gcloud run services describe shoplab-platform \
  --region us-east1 \
  --project shoplab-platform-prod \
  --format="value(status.url)"

# Smoke-test the APIs
curl https://YOUR_SERVICE_URL/api/products | jq length     # → 100
curl https://YOUR_SERVICE_URL/api/cart                     # → { items: [], total: 0 }

curl -X POST https://YOUR_SERVICE_URL/api/cart \
  -H "Content-Type: application/json" \
  -d '{"productId":"p1","quantity":1}'
```

---

### 🔄 Future deployment workflow

Every time you push new code, run this to redeploy:

```bash
cd ~/home/mail2chanu/playwright-ai-ecomm-tests && git pull

cd platform

gcloud builds submit \
  --tag asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform \
  --region asia-south1

gcloud run deploy shoplab-platform \
  --image asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform \
  --region us-east1 \
  --allow-unauthenticated \
  --project shoplab-platform-prod
```

---

### 🗂️ Artifact Registry — image management

#### List images (newest first)

```bash
gcloud artifacts docker images list \
  asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform \
  --include-tags \
  --sort-by="~CREATE_TIME"
```

#### Manually delete a specific image

```bash
gcloud artifacts docker images delete \
  asia-south1-docker.pkg.dev/shoplab-platform-prod/shoplab-platform/shoplab-platform@sha256:<DIGEST> \
  --delete-tags --quiet
```

---

### Gemini on Cloud Run

The chatbot calls the Gemini API over the internet, so no extra infrastructure is needed — just set `GEMINI_API_KEY` on the service (see *Environment variables* above).

Without `GEMINI_API_KEY` the chat API returns `503` (`Failed to connect to Gemini: ...`) and the chatbot page shows an error; all other pages and APIs work normally.

---

### ⚠️ Key learnings

- Always validate `npm run build` locally before building the Docker image
- Use Cloud Build (`gcloud builds submit`) instead of local Docker push — more reliable in Cloud Shell
- `output: "standalone"` in `next.config.ts` is required — without it the container won't start
- IAM issues usually point to the wrong service account — check Cloud Build SA permissions
- The cleanup policy (keepCount 1) prevents Artifact Registry storage from accumulating old images

---

### 💡 Optional improvements

- Custom domain mapping via Cloud Run domain mappings
- CI/CD via Cloud Build triggers on GitHub push
- Cost: `--min-instances 0` scales to zero when idle (already set above)

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
│       ├── products.ts             100 hardcoded products (7 categories)
│       └── cart-store.ts           In-memory cart (global Map)
```
