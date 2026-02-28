# 🦞 Moltbook Auto Register

Web app untuk auto-register akun AI agent di [Moltbook](https://www.moltbook.com) — the social network for AI agents.

Dibangun dengan **Next.js 16**, **TypeScript**, dan **Tailwind CSS**.

---

## ✨ Fitur

### Single Register
- Form input **Agent Name** dan **Description**
- Memanggil `POST https://www.moltbook.com/api/v1/agents/register`
- Menampilkan hasil: `api_key`, `claim_url`, `verification_code`
- Tombol **Copy** untuk setiap field
- Tombol **Download Credentials (JSON)** untuk menyimpan ke file

### ⚡ Bulk Register
- Input jumlah akun (1–20) dan prefix nama
- Nama agent di-generate otomatis: `{Prefix}{N}_{RandomSuffix}`
- Progress bar real-time
- Delay 1.2 detik antar request (menghindari rate limit)
- Tombol **Stop** untuk menghentikan proses kapan saja
- Tombol **Export All Credentials (JSON)** setelah selesai

---

## 🚀 Cara Menjalankan

### Development

```bash
cd moltbook-register
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Production Build

```bash
npm run build
npm start
```

---

## 📁 Struktur Project

```
moltbook-register/
├── app/
│   ├── api/
│   │   └── register/
│   │       └── route.ts    ← API route proxy ke moltbook.com
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

Proxy ke `https://www.moltbook.com/api/v1/agents/register`.

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

## 📋 Alur Registrasi (sesuai skill.md)

1. **Register** — Isi nama dan deskripsi agent, klik Register
2. **Simpan API Key** — Salin dan simpan `api_key` dengan aman (hanya tampil sekali!)
3. **Claim** — Kirim `claim_url` ke human owner
4. **Verifikasi** — Human owner verifikasi via:
   - Email verification (untuk login ke dashboard)
   - Tweet verification (membuktikan kepemilikan akun X)
5. **Aktif** — Agent siap digunakan di Moltbook!

> ⚠️ **Penting:** Selalu gunakan `https://www.moltbook.com` (dengan `www`). Tanpa `www` akan redirect dan menghapus Authorization header.

---

## 🔒 Keamanan

- API key **TIDAK PERNAH** dikirim ke domain selain `www.moltbook.com`
- API route Next.js (`/api/register`) bertindak sebagai proxy untuk menghindari CORS
- Credentials hanya disimpan di browser (tidak ada server-side storage)

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

## 📚 Referensi

- [Moltbook API Docs (skill.md)](https://www.moltbook.com/skill.md)
- [Moltbook Rules](https://www.moltbook.com/rules.md)
- [Moltbook Heartbeat](https://www.moltbook.com/heartbeat.md)
- [Next.js Documentation](https://nextjs.org/docs)
