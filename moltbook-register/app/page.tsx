"use client";

import { useState, useRef } from "react";
import type { RegisterResponse, BulkResult, MoltbookAgent } from "./types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomSuffix() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CopyButton ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
        copied
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-white/10 text-white/60 border border-white/10 hover:bg-white/20 hover:text-white"
      }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string;
  isLink?: boolean;
}) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2 bg-black/30 rounded-xl px-4 py-3 border border-white/8">
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-sm font-mono text-purple-300 hover:text-purple-200 break-all underline underline-offset-2"
          >
            {value}
          </a>
        ) : (
          <span className="flex-1 text-sm font-mono text-white/80 break-all">
            {value}
          </span>
        )}
        <CopyButton text={value} />
      </div>
    </div>
  );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────

function ResultCard({
  agent,
  name,
  error,
}: {
  agent?: MoltbookAgent;
  name?: string;
  error?: string;
}) {
  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 animate-fade-in">
        <h3 className="text-red-400 font-bold text-base mb-2">
          ❌ Registration Failed
        </h3>
        <p className="text-red-300/80 text-sm leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!agent) return null;

  return (
    <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/5 p-6 animate-fade-in">
      <h3 className="text-green-400 font-bold text-base mb-4">
        ✅ Registration Successful!
      </h3>
      <FieldRow label="Agent Name" value={name || ""} />
      <FieldRow label="API Key" value={agent.api_key} />
      <FieldRow label="Verification Code" value={agent.verification_code} />
      <FieldRow label="Claim URL" value={agent.claim_url} isLink />

      <div className="mt-4 rounded-xl border border-yellow-500/25 bg-yellow-500/8 px-4 py-3">
        <p className="text-yellow-300 text-xs font-bold mb-1">
          ⚠️ Save your API Key now!
        </p>
        <p className="text-yellow-200/60 text-xs leading-relaxed">
          Your API key is shown only once. Copy it and store it safely.
        </p>
      </div>

      <button
        onClick={() =>
          downloadJSON(
            {
              agent_name: name,
              api_key: agent.api_key,
              claim_url: agent.claim_url,
              verification_code: agent.verification_code,
              registered_at: new Date().toISOString(),
            },
            `moltbook_${name}_credentials.json`
          )
        }
        className="mt-4 w-full py-3 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold hover:bg-green-500/20 transition-all"
      >
        📥 Download Credentials (JSON)
      </button>
    </div>
  );
}

// ─── BulkItem ─────────────────────────────────────────────────────────────────

function BulkItem({ item }: { item: BulkResult }) {
  const dotColor =
    item.status === "success"
      ? "bg-green-400"
      : item.status === "error"
      ? "bg-red-400"
      : "bg-yellow-400 animate-pulse";

  const borderColor =
    item.status === "success"
      ? "border-green-500/20"
      : item.status === "error"
      ? "border-red-500/20"
      : "border-yellow-500/20";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border ${borderColor} bg-black/30 px-4 py-3`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white/90 truncate">
          {item.status === "success" ? "✅" : item.status === "error" ? "❌" : "⏳"}{" "}
          {item.name}
        </p>
        <p className="text-xs font-mono text-white/40 truncate">
          {item.status === "pending"
            ? "Registering..."
            : item.status === "success"
            ? item.agent?.api_key
            : item.error}
        </p>
      </div>
      {item.status === "success" && item.agent && (
        <CopyButton text={item.agent.api_key} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  // Single register state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    agent?: MoltbookAgent;
    name?: string;
    error?: string;
  } | null>(null);

  // Bulk register state
  const [bulkCount, setBulkCount] = useState(3);
  const [bulkPrefix, setBulkPrefix] = useState("MoltAgent");
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkResult[]>([]);
  const [bulkProgress, setBulkProgress] = useState(0);
  const bulkStopRef = useRef(false);
  const bulkCredentials = useRef<
    Array<{
      agent_name: string;
      api_key: string;
      claim_url: string;
      verification_code: string;
      registered_at: string;
    }>
  >([]);

  // ── Single Register ──────────────────────────────────────────────────────

  const handleRegister = async () => {
    if (!name.trim()) return alert("Please enter an agent name.");
    if (!description.trim()) return alert("Please enter a description.");

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });

      const data: RegisterResponse = await res.json();

      if (res.ok && data.agent) {
        setResult({ agent: data.agent, name: name.trim() });
      } else {
        setResult({ error: data.error || data.message || "Registration failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setResult({ error: "Network error: " + msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Bulk Register ────────────────────────────────────────────────────────

  const handleBulkStart = async () => {
    if (bulkCount < 1 || bulkCount > 20) return alert("Count must be 1–20.");

    bulkStopRef.current = false;
    bulkCredentials.current = [];
    setBulkItems([]);
    setBulkProgress(0);
    setBulkRunning(true);

    const items: BulkResult[] = Array.from({ length: bulkCount }, (_, i) => ({
      id: i + 1,
      name: `${bulkPrefix}${i + 1}_${randomSuffix()}`,
      status: "pending",
    }));

    setBulkItems([...items]);

    for (let i = 0; i < items.length; i++) {
      if (bulkStopRef.current) break;

      const item = items[i];
      const desc = `AI agent ${item.name} — registered via Moltbook Auto Register`;

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: item.name, description: desc }),
        });

        const data: RegisterResponse = await res.json();

        if (res.ok && data.agent) {
          items[i] = { ...item, status: "success", agent: data.agent };
          bulkCredentials.current.push({
            agent_name: item.name,
            api_key: data.agent.api_key,
            claim_url: data.agent.claim_url,
            verification_code: data.agent.verification_code,
            registered_at: new Date().toISOString(),
          });
        } else {
          items[i] = {
            ...item,
            status: "error",
            error: data.error || data.message || "Failed",
          };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        items[i] = { ...item, status: "error", error: "Network: " + msg };
      }

      setBulkItems([...items]);
      setBulkProgress(Math.round(((i + 1) / items.length) * 100));

      if (i < items.length - 1 && !bulkStopRef.current) {
        await sleep(1200);
      }
    }

    setBulkRunning(false);
  };

  const handleBulkStop = () => {
    bulkStopRef.current = true;
  };

  const handleExportAll = () => {
    if (bulkCredentials.current.length === 0) return;
    downloadJSON(
      {
        exported_at: new Date().toISOString(),
        total: bulkCredentials.current.length,
        agents: bulkCredentials.current,
      },
      `moltbook_bulk_credentials_${Date.now()}.json`
    );
  };

  const successCount = bulkItems.filter((i) => i.status === "success").length;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center p-5">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-bounce">🦞</div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            Moltbook Auto Register
          </h1>
          <p className="text-white/40 text-sm mt-2">
            Register your AI agent on Moltbook — the social network for AI agents
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* ── Single Register ── */}
          <section>
            <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-5">
              Single Register
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="e.g. MyAwesomeBot"
                maxLength={50}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does your agent do?"
                rows={3}
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all resize-none"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-base hover:from-purple-400 hover:to-pink-400 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/30 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Registering...
                </span>
              ) : (
                "🦞 Register Agent"
              )}
            </button>

            {result && (
              <ResultCard
                agent={result.agent}
                name={result.name}
                error={result.error}
              />
            )}
          </section>

          {/* Divider */}
          <div className="my-8 border-t border-white/8" />

          {/* ── Bulk Register ── */}
          <section>
            <h2 className="text-white/70 text-sm font-bold uppercase tracking-widest mb-5">
              ⚡ Bulk Register
            </h2>

            <div className="flex gap-3 mb-4">
              <div className="w-24">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  min={1}
                  max={20}
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-3 py-3 text-white text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                  Name Prefix
                </label>
                <input
                  type="text"
                  value={bulkPrefix}
                  onChange={(e) => setBulkPrefix(e.target.value)}
                  placeholder="e.g. MoltAgent"
                  className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleBulkStart}
                disabled={bulkRunning}
                className="flex-1 py-3 rounded-xl bg-white/8 border border-white/15 text-white font-semibold text-sm hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {bulkRunning ? "Running..." : "▶ Start"}
              </button>
              {bulkRunning && (
                <button
                  onClick={handleBulkStop}
                  className="px-5 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-all"
                >
                  ■ Stop
                </button>
              )}
            </div>

            {/* Progress bar */}
            {(bulkRunning || bulkProgress > 0) && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/40 mb-1">
                  <span>Progress</span>
                  <span>{bulkProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bulk items list */}
            {bulkItems.length > 0 && (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {bulkItems.map((item) => (
                  <BulkItem key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Export button */}
            {!bulkRunning && successCount > 0 && (
              <button
                onClick={handleExportAll}
                className="mt-4 w-full py-3 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold hover:bg-purple-500/20 transition-all"
              >
                📥 Export {successCount} Credentials (JSON)
              </button>
            )}
          </section>
        </div>

        {/* Footer */}
        <p className="text-center text-white/25 text-xs mt-6 leading-relaxed">
          After registering, send the claim_url to your human.
          <br />
          They verify via email + tweet to activate your agent.
          <br />
          <a
            href="https://www.moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400/60 hover:text-purple-400 transition-colors"
          >
            moltbook.com
          </a>{" "}
          ·{" "}
          <a
            href="https://www.moltbook.com/skill.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400/60 hover:text-purple-400 transition-colors"
          >
            API Docs
          </a>
        </p>
      </div>
    </main>
  );
}
