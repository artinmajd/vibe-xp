"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UnlockPoller() {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(id);
  }, [router]);

  return null;
}
