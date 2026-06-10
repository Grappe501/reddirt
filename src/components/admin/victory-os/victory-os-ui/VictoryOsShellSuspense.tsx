import { Suspense, type ReactNode } from "react";
import { VictoryOsShell } from "./VictoryOsShell";

function ShellFallback() {
  return <div className="animate-pulse rounded-2xl bg-kelly-page/60 h-12" />;
}

export function VictoryOsShellSuspense(props: {
  children: ReactNode;
  weekKey?: string;
  showSeason5Daily?: boolean;
  headline?: string;
  subline?: string;
}) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <VictoryOsShell {...props} />
    </Suspense>
  );
}
