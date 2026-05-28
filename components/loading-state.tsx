export function LoadingState({ label = "Loading atlas data" }: { label?: string }) {
  return (
    <div className="flex min-h-52 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-cyan-300 shadow-glow" />
        {label}
      </div>
    </div>
  );
}
