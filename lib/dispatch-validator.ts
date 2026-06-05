import { SupabaseClient } from "@supabase/supabase-js";
import { Achievement } from "@/lib/types";
import {
  ValidationResult,
  validateScreenshot,
  validateUrl,
  validateText,
  validateChecklist,
  validateFields,
  validateCodeEntry,
  validateComposite,
} from "@/lib/validators";

export async function runValidator(
  achievement: Achievement,
  proofData: Record<string, unknown>,
  screenshotUrl: string | null,
  teamId: string,
  supabase: SupabaseClient
): Promise<ValidationResult> {
  const config = achievement.proof_config;

  switch (achievement.proof_type) {
    case "screenshot":
      return validateScreenshot(screenshotUrl);
    case "url":
      return validateUrl(proofData);
    case "text":
      return validateText(proofData, config);
    case "checklist":
      return validateChecklist(proofData, config);
    case "fields":
      return validateFields(proofData, config);
    case "code_entry":
      return validateCodeEntry(proofData, teamId, supabase);
    case "composite":
      return validateComposite(proofData, screenshotUrl, config);
    case "instructor_flag":
      // Always valid — lands in pending queue for instructor review
      return { valid: true };
    default:
      return { valid: false, reason: `Unknown proof type: ${achievement.proof_type}` };
  }
}
