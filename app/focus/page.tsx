"use client";

import { useEffect } from "react";

export default function FocusRedirect() {
  useEffect(() => {
    window.location.href = "/dashboard/focus";
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
      <span>Redirecting to cockpit...</span>
    </div>
  );
}
