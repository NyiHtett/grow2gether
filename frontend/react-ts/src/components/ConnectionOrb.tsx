import { AnimatePresence, motion } from "framer-motion";
import type { Person } from "../types";

function Half({ person, side }: { person: Person; side: "me" | "partner" }) {
  const isMint = person.color === "mint";
  return (
    <div
      className={`grid flex-1 place-items-center bg-cover bg-center text-[12px] text-white/90 ${
        isMint ? "bg-mint/35" : "bg-rose/40"
      }`}
      style={person.avatar ? { backgroundImage: `url(${person.avatar})` } : undefined}
    >
      {!person.avatar && <span className="px-1 text-center leading-tight">{person.name}</span>}
      <span className="sr-only">{side}</span>
    </div>
  );
}

export function ConnectionOrb({
  me,
  partner,
}: {
  me: Person;
  partner: Person | null;
}) {
  const connected = !!partner;

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 py-8">
      <AnimatePresence mode="wait">
        {!connected ? (
          /* ---- solo: single orb, gently breathing ---- */
          <motion.div
            key="solo"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="grid h-40 w-40 place-items-center rounded-full border border-white/15 bg-cover bg-center text-center text-[13px] text-white/85 shadow-[inset_0_0_40px_rgba(255,255,255,0.18)] bg-white/10 [animation:var(--animate-breathe)]"
            style={me.avatar ? { backgroundImage: `url(${me.avatar})` } : undefined}
          >
            {!me.avatar && <span className="px-3">{me.name}</span>}
          </motion.div>
        ) : (
          /* ---- connected: two halves merged, glowing + pulsing ---- */
          <motion.div
            key="connected"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
            className="relative flex h-52 w-52 overflow-hidden rounded-full [animation:var(--animate-pulse-glow)]"
          >
            {/* rotating gradient halo behind */}
            <div className="absolute -inset-1.5 -z-10 rounded-full bg-[conic-gradient(from_0deg,var(--color-rose),var(--color-mint),var(--color-rose))] opacity-55 blur-[7px] [animation:var(--animate-spin-slow)]" />
            <Half person={me} side="me" />
            <Half person={partner!} side="partner" />
            {/* inner seam glow */}
            <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_60px_rgba(255,255,255,0.25)]" />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/40" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        {connected ? (
          <>
            <p className="text-lg font-bold">
              {me.name} <span className="text-rose-soft">&amp;</span> {partner!.name}
            </p>
            <p className="mt-0.5 text-[13px] text-muted">Connected · growing together ✦</p>
          </>
        ) : (
          <>
            <p className="text-lg font-bold">{me.name}</p>
            <p className="mt-0.5 text-[13px] text-muted">Waiting for your other half…</p>
          </>
        )}
      </div>
    </div>
  );
}
