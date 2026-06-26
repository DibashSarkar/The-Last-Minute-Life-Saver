import React from "react";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950">
      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        {children}
      </div>
      <MobileBottomNav />
    </div>
  );
}
