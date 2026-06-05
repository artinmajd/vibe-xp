import { describe, it, expect, vi } from "vitest";
import {
  validateScreenshot,
  validateUrl,
  validateText,
  validateChecklist,
  validateFields,
  validateCodeEntry,
  validateComposite,
} from "../lib/validators";

// ─── validateScreenshot ───────────────────────────────────────────────────────

describe("validateScreenshot", () => {
  it("passes when a URL is provided", () => {
    const result = validateScreenshot("https://example.com/shot.png");
    expect(result.valid).toBe(true);
  });

  it("fails when screenshot_url is null", () => {
    const result = validateScreenshot(null);
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });
});

// ─── validateUrl ─────────────────────────────────────────────────────────────

describe("validateUrl", () => {
  it("passes with a valid https URL", () => {
    const result = validateUrl({ url: "https://myapp.com" });
    expect(result.valid).toBe(true);
  });

  it("fails when URL is empty", () => {
    const result = validateUrl({ url: "" });
    expect(result.valid).toBe(false);
  });

  it("fails when URL has no protocol", () => {
    const result = validateUrl({ url: "myapp.com" });
    expect(result.valid).toBe(false);
  });

  it("fails when URL uses a non-http protocol", () => {
    const result = validateUrl({ url: "ftp://myapp.com" });
    expect(result.valid).toBe(false);
  });
});

// ─── validateText ─────────────────────────────────────────────────────────────

describe("validateText", () => {
  const config = { min_words: 5 };

  it("passes when word count meets the minimum", () => {
    const result = validateText({ text: "one two three four five" }, config);
    expect(result.valid).toBe(true);
  });

  it("passes when word count exceeds the minimum", () => {
    const result = validateText({ text: "one two three four five six seven" }, config);
    expect(result.valid).toBe(true);
  });

  it("fails when word count is below the minimum", () => {
    const result = validateText({ text: "one two three" }, config);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("5");
  });

  it("fails when text is empty", () => {
    const result = validateText({ text: "" }, config);
    expect(result.valid).toBe(false);
  });
});

// ─── validateChecklist ────────────────────────────────────────────────────────

describe("validateChecklist", () => {
  const config = { items: ["Step A", "Step B", "Step C"] };

  it("passes when all items are checked", () => {
    const result = validateChecklist({ checked: ["Step A", "Step B", "Step C"] }, config);
    expect(result.valid).toBe(true);
  });

  it("fails when some items are missing", () => {
    const result = validateChecklist({ checked: ["Step A"] }, config);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Step B");
  });

  it("fails when nothing is checked", () => {
    const result = validateChecklist({ checked: [] }, config);
    expect(result.valid).toBe(false);
  });
});

// ─── validateFields ───────────────────────────────────────────────────────────

describe("validateFields", () => {
  const config = { fields: ["Name", "Idea"] };

  it("passes when all fields have values", () => {
    const result = validateFields({ values: { Name: "Artin", Idea: "A cool app" } }, config);
    expect(result.valid).toBe(true);
  });

  it("fails when a field is empty", () => {
    const result = validateFields({ values: { Name: "Artin", Idea: "" } }, config);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("Idea");
  });

  it("fails when fields object is missing entirely", () => {
    const result = validateFields({}, config);
    expect(result.valid).toBe(false);
  });
});

// ─── validateCodeEntry ────────────────────────────────────────────────────────

describe("validateCodeEntry", () => {
  const ownTeamId = "team-abc";

  function makeSupabase(teamId: string | null) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: teamId ? { id: teamId } : null,
            }),
          }),
        }),
      }),
    } as unknown as Parameters<typeof validateCodeEntry>[2];
  }

  it("passes with a valid code that belongs to a different team", async () => {
    const result = await validateCodeEntry(
      { code: "NOVA-1234" },
      ownTeamId,
      makeSupabase("team-xyz")
    );
    expect(result.valid).toBe(true);
  });

  it("fails when the code belongs to the user's own team", async () => {
    const result = await validateCodeEntry(
      { code: "ARC-8086" },
      ownTeamId,
      makeSupabase(ownTeamId)
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("own team");
  });

  it("fails when the code does not match any team", async () => {
    const result = await validateCodeEntry(
      { code: "FAKE-0000" },
      ownTeamId,
      makeSupabase(null)
    );
    expect(result.valid).toBe(false);
  });

  it("fails when code is empty", async () => {
    const result = await validateCodeEntry({ code: "" }, ownTeamId, makeSupabase(null));
    expect(result.valid).toBe(false);
  });
});

// ─── validateComposite ────────────────────────────────────────────────────────

describe("validateComposite", () => {
  const config = {
    require: ["screenshot", "checklist"],
    items: ["Item 1", "Item 2"],
  };

  it("passes when all required parts are valid", () => {
    const result = validateComposite(
      { checked: ["Item 1", "Item 2"] },
      "https://example.com/shot.png",
      config
    );
    expect(result.valid).toBe(true);
  });

  it("fails when screenshot is missing", () => {
    const result = validateComposite(
      { checked: ["Item 1", "Item 2"] },
      null,
      config
    );
    expect(result.valid).toBe(false);
  });

  it("fails when checklist is incomplete", () => {
    const result = validateComposite(
      { checked: ["Item 1"] },
      "https://example.com/shot.png",
      config
    );
    expect(result.valid).toBe(false);
  });
});
