import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const shouldReset = process.argv.includes("--reset");

// ─── Sessions ────────────────────────────────────────────────────────────────

const sessions = [
  { id: 1, title: "Intro to AI & Vibe Coding", is_active: true },
  { id: 2, title: "Prompting Like a Pro", is_active: false },
  { id: 3, title: "Building Your First App", is_active: false },
  { id: 4, title: "Adding Features", is_active: false },
  { id: 5, title: "Styling & Polish", is_active: false },
  { id: 6, title: "Debugging & Fixing", is_active: false },
  { id: 7, title: "Multi-Page Apps", is_active: false },
  { id: 8, title: "User Interaction", is_active: false },
  { id: 9, title: "Sharing & Deploying", is_active: false },
  { id: 10, title: "Showcase & Celebration", is_active: false },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

const achievements = [
  // Block 1 — Team formation
  {
    slug: "team-names",
    session_number: 1,
    block_number: 1,
    title: "Named & Ready",
    description: "Your team has a name. You're official.",
    xp: 2,
    proof_type: "screenshot", // auto-awarded by join logic — no student form
    proof_config: {},
    is_secret: false,
  },
  {
    slug: "team-ideas",
    session_number: 1,
    block_number: 1,
    title: "App Idea Submitted",
    description: "Every team member shared what they'd build with AI.",
    xp: 2,
    proof_type: "instructor_flag",
    proof_config: { form_type: "fields", fields: ["Your app idea"] },
    is_secret: false,
  },

  // Block 3 — AI exploration
  {
    slug: "letter-counter",
    session_number: 1,
    block_number: 3,
    title: "Letter Counter",
    description: "Got the AI to confidently give the wrong letter count — and caught it in the act.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "double-down",
    session_number: 1,
    block_number: 3,
    title: "Double Down",
    description: "Asked the AI a question, then asked the exact same question again in a fresh chat and compared what changed.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "hallucination-hunter",
    session_number: 1,
    block_number: 3,
    title: "Hallucination Hunter",
    description: "Found an AI hallucination on a topic you don't know well and tracked down a source that disproved it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "fact-checker",
    session_number: 1,
    block_number: 3,
    title: "Fact Checker",
    description: "Verified an AI claim using a reliable source.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "made-it-cave",
    session_number: 1,
    block_number: 3,
    title: "Made It Cave",
    description: "Got the AI to abandon a correct answer after you pushed back with fake authority.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "past-the-cutoff",
    session_number: 1,
    block_number: 3,
    title: "Past the Cutoff",
    description: "Caught the AI hitting its knowledge cutoff — it guessed, made something up, or had to search.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 4 — Context and prompting
  {
    slug: "contradiction-machine",
    session_number: 1,
    block_number: 4,
    title: "Contradiction Machine",
    description: "Got AI to contradict itself in the same conversation.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "context-loader",
    session_number: 1,
    block_number: 4,
    title: "Context Loader",
    description: "Pasted real information into a chat (Wikipedia, a wiki, an article) and asked the AI a question about it — giving it context it didn't have before.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "text", min_words: 200 },
    is_secret: false,
  },
  {
    slug: "context-upgrade",
    session_number: 1,
    block_number: 4,
    title: "Context Upgrade",
    description: "Asked the same question with and without context, then named 3 specific things the context-fed answer got right that the first one missed.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "fields", fields: ["New detail 1", "New detail 2", "New detail 3"] },
    is_secret: false,
  },
  {
    slug: "follow-up-investigator",
    session_number: 1,
    block_number: 4,
    title: "Follow-Up Investigator",
    description: "Used follow-up questions to dig deeper into an AI answer.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "expert-witness",
    session_number: 1,
    block_number: 4,
    title: "Expert Witness",
    description: "Caught the AI stating something confidently wrong about a topic you actually know well.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 5 — Cursor setup
  {
    slug: "cursor-ready",
    session_number: 1,
    block_number: 5,
    title: "Cursor Ready",
    description: "Set up Cursor and got your coding environment ready.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Cursor installed",
        "Signed in",
        "vibe-coding folder created",
        "Folder opened in Cursor",
      ],
    },
    is_secret: false,
  },

  // Block 6 — First file
  {
    slug: "first-file",
    session_number: 1,
    block_number: 6,
    title: "First File",
    description: "Used one prompt in Cursor to create hello.html — a page that says \"Hi, I'm [your name]\" in big colorful text.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "browser-launch",
    session_number: 1,
    block_number: 6,
    title: "Browser Launch",
    description: "Got your app running in a browser for the first time.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "url" },
    is_secret: false,
  },
  {
    slug: "personalization",
    session_number: 1,
    block_number: 6,
    title: "Personalization",
    description: "Made your app your own — custom text, colors, or style.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 7 — Builder menu
  {
    slug: "add-image",
    session_number: 1,
    block_number: 7,
    title: "Add Image",
    description: "Added an image to your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-button",
    session_number: 1,
    block_number: 7,
    title: "Add Button",
    description: "Added a clickable button to your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-hyperlink",
    session_number: 1,
    block_number: 7,
    title: "Add Hyperlink",
    description: "Added a working hyperlink to your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-animation",
    session_number: 1,
    block_number: 7,
    title: "Add Animation",
    description: "Added an animation or transition to your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-custom-background",
    session_number: 1,
    block_number: 7,
    title: "Custom Background",
    description: "Added a custom background color or image.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-second-page",
    session_number: 1,
    block_number: 7,
    title: "Second Page",
    description: "Added a second page to your app with navigation.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-user-interaction",
    session_number: 1,
    block_number: 7,
    title: "User Interaction",
    description: "Added something the user can interact with (input, form, etc.).",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-sound",
    session_number: 1,
    block_number: 7,
    title: "Add Sound",
    description: "Added a sound or audio element to your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "fix-broken-page",
    session_number: 1,
    block_number: 7,
    title: "Fix a Broken Page",
    description: "Something broke and you fixed it using AI.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "undo-failed-change",
    session_number: 1,
    block_number: 7,
    title: "Undo a Failed Change",
    description: "Reverted a change that broke something and recovered cleanly.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "use-10-prompts",
    session_number: 1,
    block_number: 7,
    title: "10 Prompts",
    description: "Sent at least 10 prompts to build or improve your app.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "image-button-animation-combo",
    session_number: 1,
    block_number: 7,
    title: "Image + Button + Animation Combo",
    description: "Combined an image, a button, and an animation in one app.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Quiz sample
  {
    slug: "ai-quiz",
    session_number: 1,
    block_number: 2,
    title: "AI Knowledge Check",
    description: "Quick quiz on how AI works. Answer fast for max XP.",
    xp: 15,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "An LLM is searching the live internet for your answer.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 5,
        },
        {
          question: "The model predicts the next word based on patterns it learned.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 5,
        },
        {
          question: "When it doesn't know something, it usually admits it doesn't have the knowledge.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 5,
        },
      ],
    },
    is_secret: false,
  },

  // ─── Session 2 — Into Cursor: build your first pages ─────────────────────────

  // Block 1 — Into Cursor
  {
    slug: "s2-cursor-ready",
    session_number: 2,
    block_number: 1,
    title: "Cursor Ready",
    description: "Cursor's open, you're signed in, and your my-page folder is ready to go.",
    xp: 10,
    proof_type: "checklist", // auto-awards the moment all three are checked
    proof_config: {
      items: ["Cursor open", "Signed in", "Folder open"],
    },
    is_secret: false,
  },
  {
    slug: "first-pixels",
    session_number: 2,
    block_number: 1,
    title: "First Pixels",
    description: "Typed one prompt and watched a real page appear with your name in big colorful letters.",
    xp: 5,
    proof_type: "screenshot", // auto-confirms an image was submitted
    proof_config: {},
    is_secret: false,
  },

  // Block 2 — Lazy vs. specific
  {
    slug: "spot-the-difference",
    session_number: 2,
    block_number: 2,
    title: "Spot the Difference",
    description: "Named three things the specific pizza page had that the lazy one didn't.",
    xp: 5,
    proof_type: "fields", // auto-awards when all three are filled in
    proof_config: {
      fields: ["Difference 1", "Difference 2", "Difference 3"],
    },
    is_secret: false,
  },

  // Block 3 — Iterating
  {
    slug: "chain-builder",
    session_number: 2,
    block_number: 3,
    title: "Chain Builder",
    description: "Took your lazy pizza page and iterated it into something that looks completely different.",
    xp: 5,
    proof_type: "instructor_flag", // instructor checks it actually changed
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 4 — Builder Menu (à la carte)
  {
    slug: "add-picture",
    session_number: 2,
    block_number: 4,
    title: "Add a Picture or Emoji",
    description: "Added a picture or emoji to your page.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "visual-theme",
    session_number: 2,
    block_number: 4,
    title: "Visual Theme",
    description: "Gave your page a named look — Pokémon card, neon arcade, movie poster, you name it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "working-button",
    session_number: 2,
    block_number: 4,
    title: "Button That Does Something",
    description: "Added a button that actually makes something happen when you click it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-hover-effect",
    session_number: 2,
    block_number: 4,
    title: "Animation or Hover Effect",
    description: "Added an animation or a hover effect to your page.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "add-second-section",
    session_number: 2,
    block_number: 4,
    title: "Second Section",
    description: "Added a second section to your page.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "ten-prompts-total",
    session_number: 2,
    block_number: 4,
    title: "Ten Prompts",
    description: "Used 10 or more prompts total to build and improve your page.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "builder-combo",
    session_number: 2,
    block_number: 4,
    title: "Builder Combo",
    description: "Hit three Builder Menu items on one page.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // ─── Session 3 — The Art of Prompting ────────────────────────────────────────
  // Four more (Before & After, Reference Confirmed, Upgrade Menu, Card Complete)
  // still need product decisions before they can be added.

  // Block 0 — Launch & Setup
  {
    slug: "s3-ready-check",
    session_number: 3,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to build — tick all four to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open & signed in",
        "Session 2 folder visible",
        "New Session 3 folder created",
        "I know where the page opens",
      ],
    },
    is_secret: false,
  },

  // Block 1 — The Gap Game
  {
    slug: "s3-gap-page",
    session_number: 3,
    block_number: 1,
    title: "Same Sentence, Different Page",
    description: "Everyone typed the same sentence — upload a screenshot of the page Cursor gave you.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-spot-the-gaps",
    session_number: 3,
    block_number: 1,
    title: "Spot the Gaps",
    description: "List 5 things Cursor decided on its own — font, colors, background, mood, spacing…",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "fields", fields: ["Gap 1", "Gap 2", "Gap 3", "Gap 4", "Gap 5"] },
    is_secret: false,
  },

  // Block 2 — Vague vs. Decided
  {
    slug: "s3-guess-list",
    session_number: 3,
    block_number: 2,
    title: "Guess-List",
    description: "List 6 things the lazy \"Make tic-tac-toe.\" prompt left for Cursor to guess.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "fields", fields: ["Guess 1", "Guess 2", "Guess 3", "Guess 4", "Guess 5", "Guess 6"] },
    is_secret: false,
  },
  {
    slug: "s3-decided-build",
    session_number: 3,
    block_number: 2,
    title: "The Decided Build",
    description: "Screenshot your styled tic-tac-toe that matches the decided prompt you wrote.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-goldilocks-sort",
    session_number: 3,
    block_number: 2,
    title: "Goldilocks Sort",
    description: "For each prompt, decide: too vague, too much, or just right?",
    xp: 5,
    proof_type: "quiz",
    proof_config: {
      questions: [
        { question: "Make a cool team page.", options: ["Too vague", "Too much", "Just right"], correct_index: 0, xp: 1 },
        { question: "Hi Cursor, I hope you're doing well today. So basically we are a team and we were kind of thinking that maybe it would be nice, if it's not too hard, to have some sort of page, it could be any color really, we like blue but also red is fine, and maybe our names somewhere, and our teacher said it should look good, so yeah, something cool, thanks so much, you're the best…", options: ["Too vague", "Too much", "Just right"], correct_index: 1, xp: 1 },
        { question: "Make a one-page site for our team, the Pixel Pirates. Dark purple and gold pirate theme, team name huge at the top, three cards with each member's nickname and role, and a button that shows our battle cry. Easy to read.", options: ["Too vague", "Too much", "Just right"], correct_index: 2, xp: 1 },
        { question: "Make something fun.", options: ["Too vague", "Too much", "Just right"], correct_index: 0, xp: 1 },
        { question: "Make a one-page profile card for a player called Nova. Neon green on black, big name at the top, three stats with numbers, and a button that flips the card. Keep it readable.", options: ["Too vague", "Too much", "Just right"], correct_index: 2, xp: 1 },
      ],
    },
    is_secret: false,
  },

  // Block 3 — Nudging
  {
    slug: "s3-before-after",
    session_number: 3,
    block_number: 3,
    title: "Before & After",
    description: "Upload two screenshots: your 'before' (the Block 1 page) and your 'after' (transformed with five nudges).",
    xp: 5,
    proof_type: "instructor_flag", // ScreenshotForm allows up to 3 images per submission
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-five-lanes",
    session_number: 3,
    block_number: 3,
    title: "Five Lanes",
    description: "Used all five kinds of nudge — tick each one you steered with.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "checklist", items: ["Style", "Keep-but", "Motion", "Mood", "Polish"] },
    is_secret: false,
  },
  {
    slug: "s3-broke-it-fixed-it",
    session_number: 3,
    block_number: 3,
    title: "Broke It, Fixed It",
    description: "Something broke and you fixed it — screenshot a repair prompt (a described symptom or a pasted error with \"fix this\").",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 4 — Reference Prompting
  {
    slug: "s3-caught-it-wrong",
    session_number: 3,
    block_number: 4,
    title: "Caught It Wrong",
    description: "Cursor confidently botched the reference — screenshot the wrong result you caught.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-restyle",
    session_number: 3,
    block_number: 4,
    title: "The Restyle",
    description: "Screenshot your page after restyling it with one named reference look.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-reference-confirmed",
    session_number: 3,
    block_number: 4,
    title: "Reference Confirmed",
    description: "Upload a screenshot of your reference-styled page, then record what the neighbor team guessed — an instructor confirms the match.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["What the neighbor team guessed"],
    },
    is_secret: false,
  },
  {
    slug: "s3-double-style",
    session_number: 3,
    block_number: 4,
    title: "Double Style",
    description: "Stack two references on one page so it still reads clearly — screenshot it and name both references.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["First reference (the layout)", "Second reference (colors & fonts)"],
    },
    is_secret: false,
  },

  // Block 5 — Build Your Trading Card
  {
    slug: "s3-card-canvas",
    session_number: 3,
    block_number: 5,
    title: "Card Canvas",
    description: "Decide on paper first — fill in all 8 fields of your Card Design Canvas before you prompt.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Character name",
        "Character title",
        "Card style (named reference)",
        "Main colors",
        "Four stats with numbers",
        "Signature move",
        "Picture area (which emoji or shape?)",
        "One surprise detail",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s3-first-card",
    session_number: 3,
    block_number: 5,
    title: "First Card",
    description: "Screenshot your trading card right after your first build prompt.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  // Upgrade Menu — five à-la-carte lanes, +3 each, instructor-approved (no cap).
  {
    slug: "s3-upgrade-stronger-style",
    session_number: 3,
    block_number: 5,
    title: "Upgrade: Stronger Style",
    description: "Sharpen the border, title font, and badge so the card reads like a real one.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-upgrade-stat-drama",
    session_number: 3,
    block_number: 5,
    title: "Upgrade: Stat Drama",
    description: "Make the stats look like meters or bars that fill up, and highlight the highest one.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-upgrade-layout",
    session_number: 3,
    block_number: 5,
    title: "Upgrade: Layout",
    description: "Tidy the layout — everything aligned, nothing cramped, easy to read at a glance.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-upgrade-personality",
    session_number: 3,
    block_number: 5,
    title: "Upgrade: Personality",
    description: "Make the card feel less generic — a stronger title, a small catchphrase, a detail nobody else would have.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s3-upgrade-polish",
    session_number: 3,
    block_number: 5,
    title: "Upgrade: Polish",
    description: "Make it feel finished — spacing, contrast, and one subtle premium detail.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  {
    slug: "s3-card-complete",
    session_number: 3,
    block_number: 5,
    title: "Card Complete",
    description: "Your card is finished and meets every requirement. An instructor checks it off.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Safe name + title",
        "Emoji or shape picture area (no photo)",
        "Four stats with numbers",
        "Signature-move box",
        "A nameable reference style",
        "Three or more upgrade nudges",
        "No private information",
        "Final screenshot submitted",
      ],
    },
    is_secret: false,
  },

  // Block 6 — Showcase & Wrap
  {
    slug: "s3-showed-card",
    session_number: 3,
    block_number: 6,
    title: "We Showed Our Card",
    description: "Your team presented its card on the projector.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "checklist", items: ["We presented our card to the class"] },
    is_secret: false,
  },
  {
    slug: "s3-takeaway",
    session_number: 3,
    block_number: 6,
    title: "One-Line Takeaway",
    description: "Finish the line: \"Today I learned that when steering Cursor, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "fields", fields: ["Today I learned that when steering Cursor, I should…"] },
    is_secret: false,
  },
  {
    slug: "s3-recap-check",
    session_number: 3,
    block_number: 6,
    title: "Recap Check",
    description: "Quick myth-or-fact check on today's moves.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        { question: "A longer prompt is always a better prompt.", options: ["Myth", "Fact"], correct_index: 0, xp: 1 },
        { question: "Nudging beats restarting when a result is close.", options: ["Myth", "Fact"], correct_index: 1, xp: 1 },
      ],
    },
    is_secret: false,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Seeding vibe-xp database...");

  // Reset achievements if --reset flag is passed
  if (shouldReset) {
    console.log("--reset: truncating achievements...");
    const { error } = await supabase.from("achievements").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error("Failed to reset achievements:", error.message);
      process.exit(1);
    }
    console.log("Achievements cleared.");
  }

  // Upsert sessions
  console.log("Seeding sessions...");
  const { error: sessionsError } = await supabase
    .from("sessions")
    .upsert(sessions, { onConflict: "id" });

  if (sessionsError) {
    console.error("Failed to seed sessions:", sessionsError.message);
    process.exit(1);
  }
  console.log(`  ${sessions.length} sessions seeded.`);

  // Upsert achievements
  console.log("Seeding achievements...");
  const { error: achievementsError } = await supabase
    .from("achievements")
    .upsert(achievements, { onConflict: "slug" });

  if (achievementsError) {
    console.error("Failed to seed achievements:", achievementsError.message);
    process.exit(1);
  }
  console.log(`  ${achievements.length} achievements seeded.`);

  // Assign sort_order to any rows that don't have one yet (newly inserted rows
  // default to 0). This runs per session, in the order the rows appear in the
  // `achievements` array above. Rows that already have a sort_order are left
  // untouched, so instructor reordering done in the dashboard is preserved.
  // This guarantees future sessions never end up unordered (the bug that made
  // "Release Next" pick achievements in a random order).
  await backfillSortOrder();

  console.log("Done.");
}

async function backfillSortOrder() {
  const { data: rows, error } = await supabase
    .from("achievements")
    .select("id, slug, session_number, sort_order");

  if (error) {
    console.error("Failed to read achievements for sort_order backfill:", error.message);
    process.exit(1);
  }
  if (!rows) return;

  // Intended order within a session = position in the `achievements` array above.
  // Slugs not in the array (e.g. created via the instructor UI) sort last.
  const seedIndex = new Map(achievements.map((a, i) => [a.slug, i]));
  const rank = (slug: string) => seedIndex.get(slug) ?? Number.MAX_SAFE_INTEGER;

  // Group rows by session
  const bySession = new Map<number, typeof rows>();
  for (const r of rows) {
    if (!bySession.has(r.session_number)) bySession.set(r.session_number, []);
    bySession.get(r.session_number)!.push(r);
  }

  let assigned = 0;
  for (const group of bySession.values()) {
    const maxExisting = Math.max(0, ...group.filter((r) => r.sort_order > 0).map((r) => r.sort_order));
    const needsOrder = group
      .filter((r) => !r.sort_order || r.sort_order === 0)
      .sort((a, b) => rank(a.slug) - rank(b.slug));

    let next = maxExisting;
    for (const r of needsOrder) {
      next += 1;
      const { error: updateError } = await supabase
        .from("achievements")
        .update({ sort_order: next })
        .eq("id", r.id);
      if (updateError) {
        console.error(`Failed to set sort_order for ${r.slug}:`, updateError.message);
        process.exit(1);
      }
      assigned += 1;
    }
  }

  console.log(`  sort_order backfill: ${assigned} row(s) assigned, ${rows.length - assigned} already ordered.`);
}

main();
