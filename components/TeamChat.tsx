"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type Message = {
  id: string;
  student_id: string;
  display_name: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
};

type Broadcast = {
  id: string;
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

async function forceDownload(url: string, name: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch {
    window.open(url, "_blank");
  }
}

function MessageBubble({
  msg,
  isMine,
  showHeader,
  onLightbox,
}: {
  msg: Message;
  isMine: boolean;
  showHeader: boolean;
  onLightbox: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isImage = msg.file_type?.startsWith("image/");

  async function handleCopy() {
    if (!msg.content) return;
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  }

  return (
    <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
      {showHeader && (
        <div className="flex items-center gap-1.5 px-1 mb-0.5">
          {!isMine && (
            <span className="text-xs font-semibold text-indigo-300/80">{msg.display_name}</span>
          )}
          <span className="text-xs text-white/25">{formatTime(msg.created_at)}</span>
        </div>
      )}
      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 ${isMine ? "rounded-tr-sm" : "rounded-tl-sm"}`}
        style={{ background: isMine ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.07)" }}
      >
        {msg.content && (
          <div className="group relative">
            <p className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed">
              {msg.content}
            </p>
            <button
              onClick={handleCopy}
              className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-0.5 rounded-lg"
              style={{ background: "rgba(39,39,42,0.95)", color: copied ? "#86efac" : "#a1a1aa" }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        )}
        {msg.file_url && isImage && (
          <div className="flex flex-col gap-1.5">
            <img
              src={msg.file_url}
              alt={msg.file_name ?? "image"}
              className="max-w-full rounded-xl cursor-zoom-in object-contain"
              style={{ maxHeight: "180px", background: "rgba(0,0,0,0.2)" }}
              onClick={() => onLightbox(msg.file_url!)}
            />
            <button
              onClick={() => forceDownload(msg.file_url!, msg.file_name ?? "image")}
              className="text-xs text-indigo-300/70 hover:text-indigo-300 text-left flex items-center gap-1 transition-colors"
            >
              ↓ {msg.file_name ?? "Download"}
            </button>
          </div>
        )}
        {msg.file_url && !isImage && (
          <div className="flex items-center gap-2.5 py-0.5">
            <span className="text-xl shrink-0">📎</span>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium text-white/80 truncate" style={{ maxWidth: "160px" }} title={msg.file_name ?? undefined}>
                {msg.file_name ?? "File"}
              </span>
              <button
                onClick={() => forceDownload(msg.file_url!, msg.file_name ?? "file")}
                className="text-xs text-indigo-300/70 hover:text-indigo-300 text-left transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamChat({
  teamId,
  studentId,
}: {
  teamId: string;
  studentId: string;
}) {
  const [tab, setTab] = useState<"team" | "instructor">("team");
  const [messages, setMessages] = useState<Message[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [collapsed, setCollapsed] = useState(true);

  // Separate unread tracking per tab
  const [lastSeenTeam, setLastSeenTeam] = useState<number | null>(null);
  const [lastSeenBroadcast, setLastSeenBroadcast] = useState<number | null>(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const teamListRef = useRef<HTMLDivElement>(null);
  const broadcastListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atBottomRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/chat?team_id=${teamId}`);
    if (res.ok) {
      const { messages: msgs } = await res.json();
      setMessages(msgs);
      setLastSeenTeam((prev) => prev === null ? msgs.length : prev);
    }
  }, [teamId]);

  const fetchBroadcasts = useCallback(async () => {
    const res = await fetch("/api/broadcasts");
    if (res.ok) {
      const { broadcasts: items } = await res.json();
      setBroadcasts(items);
      setLastSeenBroadcast((prev) => prev === null ? items.length : prev);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchBroadcasts();
    const msgId = setInterval(fetchMessages, 3000);
    const bcastId = setInterval(fetchBroadcasts, 5000);
    return () => { clearInterval(msgId); clearInterval(bcastId); };
  }, [fetchMessages, fetchBroadcasts]);

  // Scroll active list to bottom when new items arrive
  useEffect(() => {
    if (!collapsed && atBottomRef.current) {
      const ref = tab === "team" ? teamListRef : broadcastListRef;
      if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [messages, broadcasts, collapsed, tab]);

  function onScroll(ref: React.RefObject<HTMLDivElement | null>) {
    const el = ref.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  function handleToggle() {
    if (collapsed) {
      markTabSeen(tab);
      atBottomRef.current = true;
    }
    setCollapsed((c) => !c);
  }

  function markTabSeen(t: "team" | "instructor") {
    if (t === "team") setLastSeenTeam(messages.length);
    else setLastSeenBroadcast(broadcasts.length);
  }

  function handleTabChange(t: "team" | "instructor") {
    setTab(t);
    markTabSeen(t);
    atBottomRef.current = true;
  }

  async function sendText() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, content: trimmed }),
    });
    setSending(false);
    atBottomRef.current = true;
    fetchMessages();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    const uploadRes = await fetch("/api/chat/upload", { method: "POST", body: fd });
    const uploadBody = await uploadRes.json();

    if (!uploadRes.ok) {
      setUploadError(uploadBody.error ?? "Upload failed.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id: teamId, file_url: uploadBody.url, file_name: uploadBody.name, file_type: uploadBody.type }),
    });

    setUploading(false);
    e.target.value = "";
    atBottomRef.current = true;
    fetchMessages();
  }

  const busy = sending || uploading;
  const unreadTeam = collapsed || tab !== "team" ? Math.max(0, messages.length - (lastSeenTeam ?? messages.length)) : 0;
  const unreadBroadcast = collapsed || tab !== "instructor" ? Math.max(0, broadcasts.length - (lastSeenBroadcast ?? broadcasts.length)) : 0;
  const totalUnread = unreadTeam + unreadBroadcast;

  return (
    <>
      <div className="flex flex-col items-end gap-3 pointer-events-none">
        {/* Chat panel */}
        {!collapsed && (
          <div
            className="w-[300px] rounded-2xl border overflow-hidden flex flex-col animate-fade-up pointer-events-auto"
            style={{
              background: "rgba(15,13,40,0.95)",
              borderColor: "rgba(99,102,241,0.2)",
              height: "480px",
              maxHeight: "calc(100vh - 120px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Tab bar */}
            <div className="shrink-0 flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {(["team", "instructor"] as const).map((t) => {
                const unread = t === "team" ? unreadTeam : unreadBroadcast;
                return (
                  <button
                    key={t}
                    onClick={() => handleTabChange(t)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 -mb-px"
                    style={{
                      borderBottomColor: tab === t ? "rgb(99,102,241)" : "transparent",
                      color: tab === t ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                    }}
                  >
                    <span>{t === "team" ? "💬 Team" : "📢 Instructor"}</span>
                    {unread > 0 && (
                      <span className="w-4 h-4 rounded-full text-white flex items-center justify-center font-bold" style={{ fontSize: "9px", background: "rgb(239,68,68)" }}>
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Team tab ── */}
            {tab === "team" && (
              <>
                <div
                  ref={teamListRef}
                  onScroll={() => onScroll(teamListRef)}
                  className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2"
                >
                  {messages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <p className="text-xs text-white/20 text-center leading-relaxed">
                        No messages yet.<br />Say hi to your team!
                      </p>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    const prev = messages[idx - 1];
                    const showHeader =
                      !prev ||
                      prev.student_id !== msg.student_id ||
                      new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 300_000;
                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMine={msg.student_id === studentId}
                        showHeader={showHeader}
                        onLightbox={setLightbox}
                      />
                    );
                  })}
                </div>

                {uploadError && (
                  <div className="px-4 py-2 shrink-0 flex items-center justify-between" style={{ background: "rgba(255,50,50,0.08)", borderTop: "1px solid rgba(255,50,50,0.2)" }}>
                    <span className="text-xs text-rose-400">{uploadError}</span>
                    <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-400 text-base ml-2 leading-none">×</button>
                  </div>
                )}

                <div className="shrink-0 px-3 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex gap-2 items-end">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
                      placeholder="Message your team…"
                      rows={1}
                      className="flex-1 resize-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 text-white/90 placeholder-white/20"
                      style={{ background: "rgba(255,255,255,0.06)", maxHeight: "80px" }}
                    />
                    <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf" className="hidden" onChange={handleFileChange} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      title="Attach file"
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors disabled:opacity-40"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      {uploading ? <span className="text-xs text-white/40">…</span> : <span className="text-base">📎</span>}
                    </button>
                    <button
                      onClick={sendText}
                      disabled={!text.trim() || busy}
                      title="Send (Enter)"
                      className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30"
                      style={{ background: text.trim() && !busy ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.06)" }}
                    >
                      <span className="text-base leading-none">↑</span>
                    </button>
                  </div>
                  <p className="text-xs text-white/15 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
                </div>
              </>
            )}

            {/* ── Instructor tab ── */}
            {tab === "instructor" && (
              <div
                ref={broadcastListRef}
                onScroll={() => onScroll(broadcastListRef)}
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              >
                {broadcasts.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-12">
                    <p className="text-xs text-white/20 text-center leading-relaxed">
                      No announcements yet.<br />Check back during class!
                    </p>
                  </div>
                ) : (
                  broadcasts.map((b) => {
                    const isImage = b.file_type?.startsWith("image/");
                    return (
                      <div key={b.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 px-1">
                          <span className="text-xs font-semibold text-amber-300/80">📢 Instructor</span>
                          <span className="text-xs text-white/25">{formatTime(b.created_at)}</span>
                        </div>
                        <div
                          className="rounded-2xl rounded-tl-sm px-3 py-2 flex flex-col gap-2"
                          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}
                        >
                          {b.content && (
                            <p className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                              {b.content}
                            </p>
                          )}
                          {b.file_url && isImage && (
                            <div className="flex flex-col gap-1.5">
                              <img
                                src={b.file_url}
                                alt={b.file_name ?? "image"}
                                className="max-w-full rounded-xl cursor-zoom-in object-contain"
                                style={{ maxHeight: "180px", background: "rgba(0,0,0,0.2)" }}
                                onClick={() => setLightbox(b.file_url!)}
                              />
                              <button
                                onClick={() => forceDownload(b.file_url!, b.file_name ?? "image")}
                                className="text-xs text-amber-300/60 hover:text-amber-300 text-left flex items-center gap-1 transition-colors"
                              >
                                ↓ {b.file_name ?? "Download"}
                              </button>
                            </div>
                          )}
                          {b.file_url && !isImage && (
                            <div className="flex items-center gap-2.5 py-0.5">
                              <span className="text-xl shrink-0">📎</span>
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-xs font-medium text-white/80 truncate" style={{ maxWidth: "160px" }} title={b.file_name ?? undefined}>
                                  {b.file_name ?? "File"}
                                </span>
                                <button
                                  onClick={() => forceDownload(b.file_url!, b.file_name ?? "file")}
                                  className="text-xs text-amber-300/60 hover:text-amber-300 text-left transition-colors"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* FAB toggle button */}
        <div className="relative pointer-events-auto">
          <button
            onClick={handleToggle}
            title={collapsed ? "Open chat" : "Close chat"}
            className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95))",
              boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
            }}
          >
            <span className="text-xl leading-none">{collapsed ? "💬" : "✕"}</span>
          </button>
          {totalUnread > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "rgb(239,68,68)" }}
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </span>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Preview" className="max-w-full max-h-full rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
          <div className="absolute top-5 right-5 flex items-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); forceDownload(lightbox, "image"); }}
              className="text-white/50 hover:text-white text-sm px-3 py-1.5 rounded-xl transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              ↓ Download
            </button>
            <button onClick={() => setLightbox(null)} className="text-white/50 hover:text-white text-2xl leading-none transition-colors">×</button>
          </div>
        </div>
      )}
    </>
  );
}
