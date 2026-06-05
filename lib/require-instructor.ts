import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Call at the top of any server component or route that requires instructor access.
export async function requireInstructor() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("instructor_auth")?.value;

  if (!auth || auth !== process.env.INSTRUCTOR_PASSCODE) {
    redirect("/instructor/login");
  }
}
