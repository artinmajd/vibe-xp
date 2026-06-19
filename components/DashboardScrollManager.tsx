"use client";

import { useEffect } from "react";

const KEY = "dashboard-scroll-y";

export default function DashboardScrollManager() {
  useEffect(() => {
    // Restore scroll position only when coming back from an achievement page
    if (document.referrer.includes("/dashboard/achievement/")) {
      const saved = sessionStorage.getItem(KEY);
      if (saved) {
        window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
      }
    }

    // Save scroll position continuously so it's always fresh
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.setItem(KEY, String(Math.round(window.scrollY)));
      }, 100);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
