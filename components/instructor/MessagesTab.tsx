"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ALLOWED_UPLOAD_TYPES_ACCEPT } from "@/lib/upload-constraints";

type CohortStudent = { id: string; name: string; team_name: string | null };

type Message = {
  id: string;
  student_id: string | null;
  sender: "instructor" | "student";
  content: string | null;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const ALL_STUDENTS = "__all__";

export default function MessagesTab({ cohortStudents }: { cohortStudents: CohortStudent[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<string>(ALL_STUDENTS);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atBottomRef = useRef(true);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/instructor/messages");
    if (res.ok) {
      const { messages: msgs } = await res.json();
      setMessages(msgs);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    const id = setInterval(fetchMessages, 4000);
    return () => clearInterval(id);
  }, [fetchMessages]);

  // Thread shown for the selected recipient:
  //  - "All Students": only broadcasts (student_id === null)
  //  - a specific student: broadcasts + that student's own private thread —
  //    the same merged view that student sees on their side.
  const thread = messages.filter((m) =>
    selected === ALL_STUDENTS ? m.student_id === null : m.student_id === null || m.student_id === selected
  );

  useEffect(() => {
    if (atBottomRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [thread.length]);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function sendText() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    await fetch("/api/instructor/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: trimmed,
        student_id: selected === ALL_STUDENTS ? null : selected,
      }),
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
    const uploadRes = await fetch("/api/instructor/messages/upload", { method: "POST", body: fd });
    const uploadBody = await uploadRes.json();

    if (!uploadRes.ok) {
      setUploadError(uploadBody.error ?? "Upload failed.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    await fetch("/api/instructor/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file_url: uploadBody.url,
        file_name: uploadBody.name,
        file_type: uploadBody.type,
        student_id: selected === ALL_STUDENTS ? null : selected,
      }),
    });

    setUploading(false);
    e.target.value = "";
    atBottomRef.current = true;
    fetchMessages();
  }

  const busy = sending || uploading;
  const selectedStudent = cohortStudents.find((s) => s.id === selected);

  return (
    <div className="flex gap-4" style={{ height: "600px" }}>
      {/* Recipient list */}
      <div className="w-56 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl overflow-y-auto">
        <button
          onClick={() => setSelected(ALL_STUDENTS)}
          className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-800 transition-colors ${
            selected === ALL_STUDENTS ? "bg-indigo-600/20 text-white" : "text-zinc-400 hover:bg-zinc-800"
          }`}
        >
          📢 All Students
        </button>
        {cohortStudents.length === 0 ? (
          <p className="text-xs text-zinc-600 px-4 py-3">No students yet.</p>
        ) : (
          cohortStudents.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left px-4 py-3 text-sm border-b border-zinc-800 transition-colors ${
                selected === s.id ? "bg-indigo-600/20 text-white" : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              <p className="truncate">{s.name}</p>
              {s.team_name && <p className="text-xs text-zinc-600 truncate">{s.team_name}</p>}
            </button>
          ))
        )}
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-sm font-semibold text-white">
            {selected === ALL_STUDENTS ? "Broadcast to all students" : selectedStudent?.name ?? "Unknown"}
          </p>
          {selected !== ALL_STUDENTS && (
            <p className="text-xs text-zinc-500">Private thread + broadcasts they've seen</p>
          )}
        </div>

        <div ref={listRef} onScroll={onScroll} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {thread.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-zinc-600">No messages yet.</p>
            </div>
          ) : (
            thread.map((m) => {
              const isMine = m.sender === "instructor";
              const isImage = m.file_type?.startsWith("image/");
              return (
                <div key={m.id} className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-1.5 px-1 mb-0.5">
                    <span className="text-xs font-semibold text-zinc-500">
                      {isMine ? (m.student_id ? "You (private)" : "You (broadcast)") : "Student"}
                    </span>
                    <span className="text-xs text-zinc-600">{formatTime(m.created_at)}</span>
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 ${isMine ? "rounded-tr-sm bg-indigo-600/30" : "rounded-tl-sm bg-zinc-800"}`}
                  >
                    {m.content && (
                      <p className="text-sm text-white/90 whitespace-pre-wrap break-words leading-relaxed">
                        {m.content}
                      </p>
                    )}
                    {m.file_url && isImage && (
                      <img
                        src={m.file_url}
                        alt={m.file_name ?? "image"}
                        onClick={() => setLightbox(m.file_url!)}
                        className="max-w-full rounded-lg cursor-zoom-in object-contain mt-1"
                        style={{ maxHeight: "160px" }}
                      />
                    )}
                    {m.file_url && !isImage && (
                      <a href={m.file_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-300 underline mt-1 block">
                        📎 {m.file_name ?? "File"}
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {uploadError && (
          <div className="px-4 py-2 flex items-center justify-between bg-rose-950/50 border-t border-rose-900">
            <span className="text-xs text-rose-400">{uploadError}</span>
            <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-400 text-sm ml-2">×</button>
          </div>
        )}

        <div className="shrink-0 px-3 py-3 border-t border-zinc-800 flex gap-2 items-end">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(); } }}
            placeholder={selected === ALL_STUDENTS ? "Broadcast a message to all students…" : `Message ${selectedStudent?.name ?? "this student"}…`}
            rows={1}
            className="flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-800 text-white placeholder-zinc-600"
            style={{ maxHeight: "80px" }}
          />
          <input ref={fileInputRef} type="file" accept={ALLOWED_UPLOAD_TYPES_ACCEPT} className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            title="Attach file"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 hover:border-zinc-500 transition-colors disabled:opacity-40"
          >
            {uploading ? <span className="text-xs text-zinc-400">…</span> : <span className="text-base">📎</span>}
          </button>
          <button
            onClick={sendText}
            disabled={!text.trim() || busy}
            className="shrink-0 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-zoom-out p-4"
        >
          <img src={lightbox} alt="Full screen" className="max-w-full max-h-full rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
