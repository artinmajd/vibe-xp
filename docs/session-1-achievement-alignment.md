# Session 1 — Achievement Alignment Report

Comparison of our seeded achievements (`scripts/seed.ts`) against the official
Session 1 course outline. Written 2026-06-10.

## Outline's intended XP sources (10 total, ≈62 XP)

| # | Outline achievement | Block | XP | Proof |
|---|---|---|---|---|
| 1 | 🏁 Assemble the Squad | 1 | +5 | team registration, 3 name fields |
| 2 | 🧠 Myth or Fact | 2 | +3 (1/question) | 3-question quiz |
| 3 | 🔢 Caught It Counting | 3 | +5 | screenshot: wrong letter count |
| 4 | 🙇 Made It Cave | 3 | +5 | screenshot: caved to teacher pushback |
| 5 | ⏰ Past the Cutoff | 3 | +5 | screenshot: knowledge-cutoff failure |
| 6 | 🎓 Expert Witness | 4 | +5 | screenshot: confidently wrong on known topic |
| 7 | 🪄 Context Wins | 4 | +5 | 3-field text: what context added |
| 8 | 🔧 Locked and Loaded | 5 | +10 | 3-item checklist |
| 9 | 👋 Hello, World | 6 | +5 | screenshot: hello.html in browser |
| 10 | Builder Menu (4 items) | 7 | +3/+3/+3/+5 | background, image, animation, button |

## Differences found (original audit)

### Block 1 — Welcome & Framing
- `team-names` "Named & Ready" (+2) — concept matches Assemble the Squad; XP is +2 vs outline's +5.
- `team-ideas` "App Idea Submitted" (+2) — EXTRA; round-the-room dream app is not an XP item in the outline.
- Quiz `ai-quiz` is tagged `block_number: 1` but belongs to Block 2.

### Block 2 — What is AI, Really?
- `ai-quiz` — 3 questions match exactly. XP is +5/question (15 max) vs outline's +1/question (3 max). Wrong block number.

### Block 3 — Mini Experiments (most misaligned)
- `letter-counter` (+5) — maps to Caught It Counting; description wrongly says "built a letter-counting tool."
- `double-down`, `hallucination-hunter`, `fact-checker` — do NOT map to the outline's 3 experiments.
- MISSING: 🙇 Made It Cave (the pushback/sycophancy test — outline's highest-value lesson).
- MISSING: ⏰ Past the Cutoff (knowledge-cutoff experiment).

### Block 4 — Stress-Test & Context
- `contradiction-machine`, `context-loader` (200-word), `follow-up-investigator` — not in outline.
- `context-upgrade` (+10, 3 fields) — partial match to Context Wins (3 fields) but framed differently and +10 vs +5.
- MISSING: 🎓 Expert Witness (screenshot of model confidently wrong on a topic the pair knows).

### Block 5 — Cursor Installation
- `cursor-ready` (+10) — XP matches; checklist has 4 items vs outline's 3 (minor).
- `neighbor-assist` (+5) — EXTRA; not an XP item in the outline.

### Block 6 — First Prompt in Cursor
- Outline has one item (Hello, World). We have three: `first-file`, `browser-launch`, `personalization`. Latter two are extra.

### Block 7 — Builder Menu
- Outline: 4 items (background +3, image +3, animate +3, button +5).
- Ours: 12 items, almost all +5. Matches: `add-custom-background`, `add-image`, `add-animation` (XP +5 vs +3), `add-button` (+5 ✓).
- 8 extra: hyperlink, second-page, user-interaction, sound, fix-broken-page, undo-failed-change, 10-prompts, image-button-animation-combo.

### Secrets
- Outline mentions none. Ours had 4: `skeptic`, `persistence`, `collaborator`, `builders-apprentice`.

## Resolution (2026-06-10, per Artin's instructions)

1. **Removed** all 4 secret achievements + `neighbor-assist` from seed, database, and app code
   (check-secrets logic, dashboard secret section, SecretUnlockedToast). Cleanup via
   `scripts/cleanup-session1.ts`.
2. **XP left unchanged** on all existing achievements (explicit instruction).
3. **Added** the 3 missing achievements, each +5, screenshot proof (`instructor_flag` / screenshot):
   - `made-it-cave` "Made It Cave" — Block 3
   - `past-the-cutoff` "Past the Cutoff" — Block 3
   - `expert-witness` "Expert Witness" — Block 4

NOT addressed (intentionally left, no instruction to change): XP mismatches on squad/quiz/builder-menu,
the extra Block 4/6/7 achievements, the quiz block_number, and the `letter-counter` description wording.
