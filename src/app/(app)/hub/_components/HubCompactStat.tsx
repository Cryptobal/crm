import type { CompactStatProps } from '../_lib/hub-types';

export function HubCompactStat({ label, value }: CompactStatProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
