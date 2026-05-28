import type { ReactNode } from "react";
import { AtlasNavbar } from "./atlas-navbar";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  fullBleed = false,
  hideNavbar = false
}: {
  children: ReactNode;
  fullBleed?: boolean;
  hideNavbar?: boolean;
}) {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      {hideNavbar ? null : <AtlasNavbar />}
      <main
        className={cn(
          fullBleed
            ? hideNavbar
              ? "h-screen"
              : "h-[calc(100vh-64px)]"
            : "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        )}
      >
        {children}
      </main>
    </div>
  );
}
