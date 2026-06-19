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

  // ─── Session 2 — From Prompt to Page ────────────────────────────────────────

  // Block 0 — Setup & Team Check-In
  {
    slug: "s2-team-check-in",
    session_number: 2,
    block_number: 0,
    title: "Team Check-In",
    description: "Confirm your team is here and ready — tick the box to log in for the day.",
    xp: 5,
    proof_type: "checklist",
    proof_config: {
      items: ["All team members are confirmed, present, and signed in"],
    },
    is_secret: false,
  },

  // Block 1 — Cursor Basics & Your First Page
  {
    slug: "s2-everyones-in",
    session_number: 2,
    block_number: 1,
    title: "Everyone's In",
    description: "Every member has Cursor open, signed in, the session-2-build folder created, and the chat panel open.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Folder session-2-build created",
        "Chat panel open",
        "Every team member knows where the page appears",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-first-page-live",
    session_number: 2,
    block_number: 1,
    title: "First Page Live",
    description: "Your name/nickname page renders in the browser. Screenshot it — this is your \"before\" picture for the whole day.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-spot-the-guesses",
    session_number: 2,
    block_number: 1,
    title: "Spot the Guesses",
    description: "After your first page appears, list three things Cursor chose on its own — without you telling it.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Thing Cursor decided on its own #1",
        "Thing Cursor decided on its own #2",
        "Thing Cursor decided on its own #3",
      ],
    },
    is_secret: false,
  },

  // Block 2 — Vague vs. Specific Prompts
  {
    slug: "s2-the-lazy-page",
    session_number: 2,
    block_number: 2,
    title: "The Lazy Page",
    description: "Build the vague pizza page (\"Make a page about pizza.\") and screenshot it — leave it untouched.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-diagnosis",
    session_number: 2,
    block_number: 2,
    title: "Diagnosis",
    description: "List six things Cursor had to guess on the vague pizza page because you didn't say.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Colors and fonts — what did Cursor choose?",
        "Title — what did Cursor invent?",
        "Sections — what did Cursor decide to include?",
        "Who is the page for? Did you say? What did Cursor assume?",
        "Is there anything to click? What did Cursor decide?",
        "Style or vibe — what did Cursor go with?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-the-directed-page",
    session_number: 2,
    block_number: 2,
    title: "The Directed Page",
    description: "Build the specific pizza page from the fully loaded prompt and screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-seven-ingredients",
    session_number: 2,
    block_number: 2,
    title: "Seven Ingredients",
    description: "Rewrite the weak dog prompt so it includes all seven ingredients — tick each one you used.",
    xp: 7,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Topic — what the page is about",
        "Audience — who it's for",
        "Vibe — funny, serious, futuristic, cozy…",
        "Visual style — colors, layout, theme, font feeling",
        "Structure — title, sections, cards, list, facts…",
        "Interaction — button, quiz, random picker, counter…",
        "Constraints — one page, easy to read, no private info…",
      ],
    },
    is_secret: false,
  },

  // Block 3 — Improving Without Restarting
  {
    slug: "s2-no-restart-remake",
    session_number: 2,
    block_number: 3,
    title: "No-Restart Remake",
    description: "Transform the vague pizza page using four follow-up prompts — one of each type — without restarting.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Style prompt used",
        "Structure prompt used",
        "Interaction prompt used",
        "Polish or debug prompt used",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-before-after",
    session_number: 2,
    block_number: 3,
    title: "Before & After",
    description: "Upload your before (vague pizza page) and after (transformed page) screenshots in one submission.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 4 — Build Your Own Page
  {
    slug: "s2-safe-and-sound",
    session_number: 2,
    block_number: 4,
    title: "Safe & Sound",
    description: "Confirm your page uses first names or nicknames only — no private information.",
    xp: 3,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Our page uses first names or nicknames only — no address, school, phone, passwords, or private details",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-design-canvas",
    session_number: 2,
    block_number: 4,
    title: "Design Canvas",
    description: "Fill all eight fields of your build canvas before you write the first prompt.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Topic (what is the page about?)",
        "Audience (who is it for?)",
        "Vibe (funny, serious, futuristic, cozy…?)",
        "Visual theme (named look or style)",
        "Main colors",
        "Three sections (name all three)",
        "Interactive feature (what does it do?)",
        "Surprise detail",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-its-alive",
    session_number: 2,
    block_number: 4,
    title: "It's Alive",
    description: "The first version of your own page renders in the browser — screenshot it.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-visual-identity",
    session_number: 2,
    block_number: 4,
    title: "Upgrade: Visual Identity",
    description: "Make the visual theme stronger — more consistent colors, better spacing, a title style that matches.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-content",
    session_number: 2,
    block_number: 4,
    title: "Upgrade: Content",
    description: "Improve the text so it is more interesting, specific, and fun to read — short and clear.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-layout",
    session_number: 2,
    block_number: 4,
    title: "Upgrade: Layout",
    description: "Organize the page into clean sections or cards — make the layout easier to scan.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-interaction",
    session_number: 2,
    block_number: 4,
    title: "Upgrade: Interaction",
    description: "Make the interactive feature more useful and fun — it should change something on the page when clicked.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-upgrade-polish",
    session_number: 2,
    block_number: 4,
    title: "Upgrade: Polish",
    description: "Make the page feel finished — improve spacing, headings, contrast, and small visual details.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-working-feature",
    session_number: 2,
    block_number: 4,
    title: "Working Feature",
    description: "Screenshot your interactive feature on the page — it must visibly do something.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-checkpoint",
    session_number: 2,
    block_number: 4,
    title: "Checkpoint",
    description: "Submit your best prompt so far and one thing you still want to improve.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Your best prompt so far",
        "One thing you still want to improve",
      ],
    },
    is_secret: false,
  },

  // Block 5 — Debugging & Remixing
  {
    slug: "s2-good-bug-report",
    session_number: 2,
    block_number: 5,
    title: "Good Bug Report",
    description: "Pick the most useful way to describe a broken button.",
    xp: 1,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "Pick the most useful way to describe a broken button.",
          options: [
            "It doesn't work.",
            "The button appears, but nothing happens.",
            "I expected the button to show a random fact. Instead, nothing happens when I click it. Please fix it so a new fact appears each time.",
          ],
          correct_index: 2,
          xp: 1,
        },
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-bug-hunt",
    session_number: 2,
    block_number: 5,
    title: "Bug Hunt",
    description: "Find one real weakness on your page, write a fix prompt using the formula, and upload a before-and-after screenshot.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-remix-applied",
    session_number: 2,
    block_number: 5,
    title: "Remix Applied",
    description: "Apply your drawn Remix Card using prompts only and screenshot the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s2-peer-test",
    session_number: 2,
    block_number: 5,
    title: "Peer Test",
    description: "Test a neighboring team's page and fill the four peer-test fields.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "What is the page about?",
        "What is its strongest part?",
        "What did you click or try on the page?",
        "One thing to improve",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-got-tested",
    session_number: 2,
    block_number: 5,
    title: "Got Tested",
    description: "Another team tested your page — enter their team name as proof the feedback happened.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Testing team's name"],
    },
    is_secret: false,
  },
  {
    slug: "s2-final-fix",
    session_number: 2,
    block_number: 5,
    title: "Final Fix",
    description: "Apply one repair or polish prompt based on the peer feedback you received and upload the result.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 6 — Showcase & Wrap
  {
    slug: "s2-ship-it",
    session_number: 2,
    block_number: 6,
    title: "Ship It",
    description: "Tick every box on the finish-line checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "The page has a title",
        "The page has at least three sections",
        "The page has a clear visual theme",
        "The page has a working interactive feature",
        "Improved with at least four follow-up prompts",
        "Went through a peer test",
        "Went through a debug or polish prompt",
        "Final screenshot uploaded",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-final-page",
    session_number: 2,
    block_number: 6,
    title: "Final Page",
    description: "Upload your final screenshot and fill the submission card.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: [
        "Page title",
        "Your best prompt",
        "The bug or weakness you fixed",
        "One thing you're proud of",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s2-we-showed-it",
    session_number: 2,
    block_number: 6,
    title: "We Showed It",
    description: "Your team presented its page in the showcase.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team presented in the showcase"],
    },
    is_secret: false,
  },
  {
    slug: "s2-one-thing-i-learned",
    session_number: 2,
    block_number: 6,
    title: "One Thing I Learned",
    description: "Finish the line: \"When building with AI, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["When building with AI, I should…"],
    },
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

  // ─── Session 4 — Plan Before You Build ───────────────────────────────────────

  // Block 0 — Kickoff
  {
    slug: "s4-ready-check",
    session_number: 4,
    block_number: 0,
    title: "Ready Check",
    description: "You're set up and ready to build — tick all four to log in for the day.",
    xp: 10,
    proof_type: "checklist",
    proof_config: {
      items: [
        "Cursor open and signed in",
        "Session 3 folder still present (trading card survived!)",
        "New session-4-site folder created",
        "I know where pages open in the browser",
      ],
    },
    is_secret: false,
  },

  // Block 1 — One-Sentence Site
  {
    slug: "s4-the-wreck",
    session_number: 4,
    block_number: 1,
    title: "The Wreck",
    description: "Screenshot your one-shot site — left completely untouched. Wrecks score; repaired wrecks don't.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-wreck-hunt",
    session_number: 4,
    block_number: 1,
    title: "Wreck Hunt",
    description: "Inspect the one-shot site by clicking and list 6 things that broke or drifted.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Did a nav exist on every page? What did you find?",
        "Did all nav links work when you clicked them? What happened?",
        "Were colors and fonts consistent across pages? What differed?",
        "Was the organization name the same on every page? What did you notice?",
        "What facts did Cursor invent that nobody asked for?",
        "What was the visitor supposed to do, and was it clear?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-dead-link-found",
    session_number: 4,
    block_number: 1,
    title: "Dead Link Found",
    description: "Screenshot a broken or missing nav link you found by actually clicking it.",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 2 — Plan in Four Zoom Levels
  {
    slug: "s4-zoom-sheet",
    session_number: 4,
    block_number: 2,
    title: "Zoom Sheet",
    description: "Complete all four zoom levels (Idea → Visitor → Pages → Details) for your real project.",
    xp: 8,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "The Idea (one sentence: what is it and why is it cool?)",
        "The Visitor — who lands here?",
        "The Visitor — what should they feel?",
        "The Visitor — what should they do?",
        "Page 1 — name",
        "Page 1 — purpose",
        "Page 2 — name",
        "Page 2 — purpose",
        "Page 3 — name",
        "Page 3 — purpose",
        "Nav rule (write: same nav on every page, linking all three)",
        "Page 1 — sections (list 2–3)",
        "Page 2 — sections (list 2–3)",
        "Page 3 — sections (list 2–3)",
        "Which page holds the interactive feature, and what does it do?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-zero-questions",
    session_number: 4,
    block_number: 2,
    title: "Zero Questions",
    description: "A neighbor reads your Zoom Sheet cold and confirms they could build from it without asking anything.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Neighbor team's name",
        "Did they confirm they could build from your plan with no questions? Write their answer — or any question they had.",
      ],
    },
    is_secret: false,
  },

  // Block 3 — Write the Brief
  {
    slug: "s4-brief-canvas",
    session_number: 4,
    block_number: 3,
    title: "Brief Canvas",
    description: "Upload a photo of your completed Brief Canvas (all fields, page map, three Always + two Never rules).",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["screenshot", "fields"],
      fields: ["What is your organization's name?"],
    },
    is_secret: false,
  },
  {
    slug: "s4-identity-locked",
    session_number: 4,
    block_number: 3,
    title: "Identity Locked",
    description: "Your organization's identity is fully decided — name, slogan, mascot, and colors.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Organization name", "Slogan", "Mascot emoji", "2–3 colors"],
    },
    is_secret: false,
  },

  // Block 4 — Cursor Plan Mode
  {
    slug: "s4-plan-generated",
    session_number: 4,
    block_number: 4,
    title: "Plan Generated",
    description: "Screenshot Cursor's plan from Plan Mode, generated from your brief — nothing built yet.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-patch-the-gaps",
    session_number: 4,
    block_number: 4,
    title: "Patch the Gaps",
    description: "List each clarifying question Cursor asked and how you answered it. If it asked none, write \"zero questions.\"",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Cursor's clarifying questions and your answers (or \"zero questions\")"],
    },
    is_secret: false,
  },
  {
    slug: "s4-plan-inspection",
    session_number: 4,
    block_number: 4,
    title: "Plan Inspection",
    description: "Complete the Plan Inspection Card — all eight checks ticked, any fix logged. The Debugger leads.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "composite",
      require: ["checklist", "fields"],
      items: [
        "All three pages from our map are in the plan",
        "The same nav on every page",
        "Our name, slogan, and mascot are in there",
        "Our colors and reference style are respected",
        "Every section from our map is present",
        "Nothing invented that we never asked for",
        "Nothing missing",
        "Order is sensible — home page first",
      ],
      fields: ["Fix we sent to Plan Mode (write \"none\" if no fix was needed)"],
    },
    is_secret: false,
  },
  {
    slug: "s4-read-before-approve",
    session_number: 4,
    block_number: 4,
    title: "Read Before Approve",
    description: "Screenshot the chat showing your approval message came after the inspection notes — never approve a plan you haven't read.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-home-page-from-the-plan",
    session_number: 4,
    block_number: 4,
    title: "Home Page From the Plan",
    description: "Screenshot the home page built from the approved plan — identity visible (name, slogan, mascot) and a working nav with all three page links.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 5 — New Chat Amnesia
  {
    slug: "s4-caught-the-drift",
    session_number: 4,
    block_number: 5,
    title: "Caught the Drift",
    description: "Screenshot the home page and page two side by side, showing the mismatch after the fresh-chat wipe.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-cursor-forgot",
    session_number: 4,
    block_number: 5,
    title: "Cursor Forgot ___",
    description: "In one sentence, name what the fresh chat forgot.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Complete the sentence: \"Cursor forgot ___.\""],
    },
    is_secret: false,
  },
  {
    slug: "s4-agents-md-exists",
    session_number: 4,
    block_number: 5,
    title: "agents.md Exists",
    description: "Screenshot the contents of your agents.md — all required sections present, created and edited by prompts only.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-snap-back-confirmed",
    session_number: 4,
    block_number: 5,
    title: "Snap-Back Confirmed",
    description: "After \"make every page match agents.md\", a rival team clicks through and confirms the drifted page now matches.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm when they clicked through?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-page-three-confirmed",
    session_number: 4,
    block_number: 5,
    title: "Page Three Confirmed",
    description: "A rival team confirms page three (built post-wipe from agents.md) matches the site map and the rest of the site, with nav updated everywhere.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm about page three?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-two-wipes",
    session_number: 4,
    block_number: 5,
    title: "Two Wipes",
    description: "In one sentence, compare Wipe #1 (the drift) with Wipe #2 (the snap-back). What changed?",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["In one sentence, what was different between Wipe #1 (the drift) and Wipe #2 (the snap-back)?"],
    },
    is_secret: false,
  },

  // Block 6 — Remix Round
  {
    slug: "s4-file-first",
    session_number: 4,
    block_number: 6,
    title: "File First",
    description: "Screenshot the chat showing you updated agents.md before sending the remix prompt to the pages.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },
  {
    slug: "s4-remix-everywhere",
    session_number: 4,
    block_number: 6,
    title: "Remix Everywhere",
    description: "A rival team runs the Site-Check Card and confirms the remix landed on every page and nothing else broke.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: [
        "Rival team's name",
        "What did the rival team confirm when they ran the Site-Check Card?",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-broke-it-fixed-it",
    session_number: 4,
    block_number: 6,
    title: "Broke It, Fixed It",
    description: "Screenshot a repair prompt you used — a described symptom or an error pasted with \"fix this.\" (Optional)",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: { form_type: "screenshot" },
    is_secret: false,
  },

  // Block 7 — Showcase & Wrap
  {
    slug: "s4-site-complete",
    session_number: 4,
    block_number: 7,
    title: "Site Complete",
    description: "Tick every box on the completion checklist — an instructor confirms before XP awards.",
    xp: 10,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: [
        "Brief fully done (identity + Always/Never rules)",
        "Plan inspected and approved before building",
        "agents.md created with every section, by prompts only",
        "Three pages reachable from the same nav on every page (clicked in front of a witness)",
        "Identity and theme consistent across pages (rival-confirmed)",
        "The interactive feature works",
        "At least one page built after a chat wipe",
        "Remix visible on every page",
      ],
    },
    is_secret: false,
  },
  {
    slug: "s4-we-toured-our-site",
    session_number: 4,
    block_number: 7,
    title: "We Toured Our Site",
    description: "Your team gave the fifteen-second nav tour on the projector.",
    xp: 5,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "checklist",
      items: ["Our team gave the fifteen-second nav tour on the projector"],
    },
    is_secret: false,
  },
  {
    slug: "s4-one-line-takeaway",
    session_number: 4,
    block_number: 7,
    title: "One-Line Takeaway",
    description: "Finish the line: \"Today I learned that before I build, I should ___.\"",
    xp: 3,
    proof_type: "instructor_flag",
    proof_config: {
      form_type: "fields",
      fields: ["Today I learned that before I build, I should…"],
    },
    is_secret: false,
  },
  {
    slug: "s4-recap-check",
    session_number: 4,
    block_number: 7,
    title: "Recap Check",
    description: "Quick myth-or-fact check on today's big ideas. +1 per correct answer.",
    xp: 2,
    proof_type: "quiz",
    proof_config: {
      questions: [
        {
          question: "A new chat remembers your last conversation by default.",
          options: ["Myth", "Fact"],
          correct_index: 0,
          xp: 1,
        },
        {
          question: "agents.md is read at the start of every chat, automatically.",
          options: ["Myth", "Fact"],
          correct_index: 1,
          xp: 1,
        },
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
