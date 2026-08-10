"use client";

import { useState } from "react";

// Browsers won't let a webpage trigger the OS's native emoji keyboard (that's
// a system shortcut — Win+. / Ctrl+Cmd+Space — the user has to press
// themselves). This is a small in-page picker instead: click the field and a
// grid of common team-emoji options appears, click one to fill it in. Typing
// still works too, for anyone who wants an emoji not in the list.
const EMOJI_OPTIONS = [
  "🚀", "🎮", "🐹", "🎯", "⚡", "🔥", "🌟", "🏆", "🎨", "🧠",
  "🤖", "👾", "🎲", "🦄", "🐲", "🦊", "🐼", "🦁", "🐸", "🐙",
  "🍕", "🍩", "☕", "🌈", "💎", "🛸", "🎃", "👑", "🥷", "🧙",
  "🐝", "🦖", "🍀", "⚔️", "🛡️", "🎪", "🎭", "🧊", "🌪️", "☄️",
];

export default function EmojiPickerInput({
  value,
  onChange,
  placeholder = "🚀",
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        placeholder={placeholder}
        className={className}
      />
      {open && (
        // onMouseDown (not onClick) fires before the input's onBlur closes
        // the picker, so preventDefault here keeps it open long enough for
        // the emoji button's own onClick to register the selection.
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute z-30 top-full left-0 mt-1 grid grid-cols-6 gap-0.5 bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl w-52"
        >
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className="text-lg leading-none hover:bg-zinc-700 rounded p-1.5 transition-colors cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
