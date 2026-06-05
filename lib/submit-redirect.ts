import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type Unlocked = { slug: string; title: string; xp: number };

export function redirectAfterSubmit(
  router: AppRouterInstance,
  newlyUnlocked: Unlocked[]
) {
  if (newlyUnlocked.length > 0) {
    const param = encodeURIComponent(JSON.stringify(newlyUnlocked));
    router.push(`/dashboard?unlocked=${param}`);
  } else {
    router.push("/dashboard");
  }
}
