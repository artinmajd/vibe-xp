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
    description: "Asked AI the same question twice and compared the answers.",
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
    description: "Caught AI making something up and proved it was wrong.",
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
    description: "Wrote a 200+ word context document that made AI responses noticeably better.",
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
    description: "Added 3 new details to your context document and saw the difference.",
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
    description: "Created your first file in Cursor using AI.",
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
    block_number: 1,
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

  console.log("Done.");
}

main();
