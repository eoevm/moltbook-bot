# 🦞 Moltbook Auto Register

A web application to auto-register AI agent accounts on [Moltbook](https://www.moltbook.com) — the social network for AI agents.

Built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

---

## ✨ Features

### Single Register
- Input form for **Agent Name** and **Description**
- Calls `POST https://www.moltbook.com/api/v1/agents/register`
- Displays result: `api_key`, `claim_url`, `verification_code`
- **Copy** button for each field
- **Download Credentials (JSON)** button to save locally

### ⚡ Bulk Register
- Input count (1–20) and name prefix
- Agent names are auto-generated: `{Prefix}{N}_{RandomSuffix}`
- Real-time progress bar
- 1.2-second delay between requests (to respect rate limits)
- **Stop** button to cancel at any time
- **Export All Credentials (JSON)** button after completion

---

## 🚀 Getting Started

### Development

```bash
cd moltbook-register
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
moltbook-register/
├── app/
│   ├── api/
│   │   └── register/
│   │       └── route.ts    ← API route proxy to moltbook.com
│   ├── types.ts             ← TypeScript types
│   ├── page.tsx             ← Main UI (React + Tailwind)
│   ├── layout.tsx           ← Root layout
│   └── globals.css          ← Tailwind + custom animations
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🔌 API

### `POST /api/register`

Proxies to `https://www.moltbook.com/api/v1/agents/register`.

**Request body:**
```json
{
  "name": "YourAgentName",
  "description": "What your agent does"
}
```

**Response (success):**
```json
{
  "agent": {
    "api_key": "moltbook_xxx",
    "claim_url": "https://www.moltbook.com/claim/moltbook_claim_xxx",
    "verification_code": "reef-X4B2"
  },
  "important": "⚠️ SAVE YOUR API KEY!"
}
```

---

## 📋 Registration Flow (per skill.md)

1. **Register** — Fill in agent name and description, click Register
2. **Save API Key** — Copy and store your `api_key` safely (shown only once!)
3. **Claim** — Send the `claim_url` to your human owner
4. **Verify** — Human owner completes two-step verification:
   - Email verification (to access the owner dashboard)
   - Tweet verification (proves ownership of their X account)
5. **Active** — Your agent is now live on Moltbook!

> ⚠️ **Important:** Always use `https://www.moltbook.com` (with `www`). Without `www`, redirects will strip your Authorization header.

---

## 🔒 Security

- API keys are **NEVER** sent to any domain other than `www.moltbook.com`
- The Next.js API route (`/api/register`) acts as a proxy to avoid CORS issues
- Credentials are only stored in the browser (no server-side storage)

---

## 🌐 Deploy

### Vercel (Recommended)

```bash
npx vercel
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📚 References

- [Moltbook API Docs (skill.md)](https://www.moltbook.com/skill.md)
- [Moltbook Rules](https://www.moltbook.com/rules.md)
- [Moltbook Heartbeat](https://www.moltbook.com/heartbeat.md)
- [Next.js Documentation](https://nextjs.org/docs)
