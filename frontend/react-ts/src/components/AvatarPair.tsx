import type { Person } from "../types";
import { cn } from "../lib/cn";

function initial(name?: string) {
  return name?.trim()?.[0]?.toUpperCase() ?? "?";
}

function Chip({
  person,
  fallback,
  glow,
}: {
  person: Person | null;
  fallback: string;
  glow?: boolean;
}) {
  const isMint = person?.color === "mint";
  return (
    <div
      className={cn(
        "grid h-9 w-9 place-items-center rounded-full border-2 border-ink-0 text-sm font-bold bg-cover bg-center transition",
        isMint ? "bg-mint/60 text-mint-soft" : "bg-rose/60 text-rose-soft",
        glow && "ring-2 ring-white/70 shadow-[0_0_10px_2px_rgba(255,255,255,0.5)]",
      )}
      style={person?.avatar ? { backgroundImage: `url(${person.avatar})` } : undefined}
      title={person?.name ?? fallback}
    >
      {!person?.avatar && initial(person?.name ?? fallback)}
    </div>
  );
}

export function AvatarPair({
  me,
  partner,
}: {
  me: Person | null;
  partner: Person | null;
}) {
  const linked = !!(me && partner);
  return (
    <div className="flex items-center gap-2">
      <Chip person={me} fallback="?" glow={linked} />
      <Chip person={partner} fallback="+" glow={linked} />
    </div>
  );
}