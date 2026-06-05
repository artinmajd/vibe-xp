import { SupabaseClient } from "@supabase/supabase-js";

export type ValidationResult = {
  valid: boolean;
  reason?: string;
};

export function validateScreenshot(screenshotUrl: string | null): ValidationResult {
  if (!screenshotUrl) return { valid: false, reason: "Screenshot is required." };
  return { valid: true };
}

export function validateUrl(proofData: Record<string, unknown>): ValidationResult {
  const url = proofData.url as string | undefined;
  if (!url?.trim()) return { valid: false, reason: "URL is required." };
  try {
    const parsed = new URL(url.trim());
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, reason: "URL must start with http:// or https://" };
    }
  } catch {
    return { valid: false, reason: "That doesn't look like a valid URL." };
  }
  return { valid: true };
}

export function validateText(
  proofData: Record<string, unknown>,
  config: Record<string, unknown>
): ValidationResult {
  const text = proofData.text as string | undefined;
  if (!text?.trim()) return { valid: false, reason: "Text is required." };
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minWords = (config.min_words as number) ?? 0;
  if (wordCount < minWords) {
    return { valid: false, reason: `Need at least ${minWords} words — you have ${wordCount}.` };
  }
  return { valid: true };
}

export function validateChecklist(
  proofData: Record<string, unknown>,
  config: Record<string, unknown>
): ValidationResult {
  const items = (config.items as string[]) ?? [];
  const checked = (proofData.checked as string[]) ?? [];
  const missing = items.filter((item) => !checked.includes(item));
  if (missing.length > 0) {
    return { valid: false, reason: `Not all items checked: ${missing.join(", ")}` };
  }
  return { valid: true };
}

export function validateFields(
  proofData: Record<string, unknown>,
  config: Record<string, unknown>
): ValidationResult {
  const fields = (config.fields as string[]) ?? [];
  const values = (proofData.values as Record<string, string>) ?? {};
  const empty = fields.filter((f) => !values[f]?.trim());
  if (empty.length > 0) {
    return { valid: false, reason: `Fill in all fields: ${empty.join(", ")}` };
  }
  return { valid: true };
}

export async function validateCodeEntry(
  proofData: Record<string, unknown>,
  ownTeamId: string,
  supabase: SupabaseClient
): Promise<ValidationResult> {
  const code = (proofData.code as string | undefined)?.trim().toUpperCase();
  if (!code) return { valid: false, reason: "Enter a team code." };

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (!team) return { valid: false, reason: "That code doesn't match any team." };
  if (team.id === ownTeamId) return { valid: false, reason: "That's your own team's code." };

  return { valid: true };
}

export function validateComposite(
  proofData: Record<string, unknown>,
  screenshotUrl: string | null,
  config: Record<string, unknown>
): ValidationResult {
  const required = (config.require as string[]) ?? [];

  for (const type of required) {
    let result: ValidationResult;
    if (type === "screenshot") {
      result = validateScreenshot(screenshotUrl);
    } else if (type === "checklist") {
      result = validateChecklist(proofData, config);
    } else if (type === "url") {
      result = validateUrl(proofData);
    } else if (type === "text") {
      result = validateText(proofData, config);
    } else if (type === "fields") {
      result = validateFields(proofData, config);
    } else {
      continue;
    }
    if (!result.valid) return result;
  }

  return { valid: true };
}
