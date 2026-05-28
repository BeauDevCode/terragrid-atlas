import Link from "next/link";
import { Activity, BarChart3, Database, GitCompare, Globe2, Map, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

const navItems = [
  { href: "/atlas", label: "Atlas", icon: Map },
  { href: "/dashboard/US", label: "Regions", icon: BarChart3 },
  { href: "/explorer", label: "Explorer", icon: Database },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/methodology", label: "Methodology", icon: Activity }
];

export function AtlasNavbar() {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-slate-800/80 bg-slate-950/84 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-glow">
            <Globe2 className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-wide text-slate-50">TerraGrid Atlas</span>
            <span className="block truncate text-xs text-cyan-100/70">Global Grid Intelligence</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm text-slate-300 transition hover:bg-white/8 hover:text-slate-50"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Badge variant="green" className="hidden sm:inline-flex">
            <Zap className="h-3.5 w-3.5" />
            Demo data
          </Badge>
          <Link
            href="/atlas"
            className="inline-flex h-9 items-center rounded-md bg-cyan-300 px-3 text-sm font-medium text-slate-950 shadow-glow transition hover:bg-cyan-200"
          >
            Open Atlas
          </Link>
        </div>
      </div>
    </header>
  );
}
