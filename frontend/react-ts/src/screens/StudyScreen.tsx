import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";

function fmtClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
function fmtHours(ms: number) {
  return (ms / 3_600_000).toFixed(1);
}
function fmtDur(ms: number) {
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

export function StudyScreen() {
  const { me, partner, sessions, activeSession, clockIn, clockOut } = useApp();
  const [together, setTogether] = useState(false);
  const [, forceTick] = useState(0);

  const running = !!activeSession;

  // live tick while clocked in
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = activeSession ? Date.now() - activeSession.start : 0;

  const totals = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const s of sessions) acc[s.personId] = (acc[s.personId] ?? 0) + (s.end - s.start);
    return acc;
  }, [sessions]);

  if (!me) return null;
  const isTogether = activeSession?.together ?? together;

  return (
    <div className="flex flex-1 flex-col px-[18px] pb-8">
      {/* status */}
      <div className="glass mt-3 flex items-center gap-3.5 rounded-2xl p-4.5">
        <span
          className={cn(
            "text-3xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]",
            running && isTogether && "[animation:var(--animate-beat)]",
          )}
        >
          {isTogether ? "♥" : "♡"}
        </span>
        <div>
          <p className="text-lg font-bold">{isTogether ? "Together" : "Alone"}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {running
              ? isTogether
                ? `Studying with ${partner?.name ?? "your partner"}`
                : "Focused solo session"
              : "Choose a mode, then clock in"}
          </p>
        </div>
      </div>

      {/* mode toggle (only when not running) */}
      {!running && (
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            { v: false, label: "Alone ♡" },
            { v: true, label: "Together ♥" },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              onClick={() => setTogether(opt.v)}
              disabled={opt.v && !partner}
              className={cn(
                "rounded-xl py-3 text-[15px] font-semibold transition",
                together === opt.v ? "glass-rose" : "glass",
                opt.v && !partner && "opacity-40",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* timer + clock button */}
      <div className="my-7 text-center">
        <p className="mb-2 font-mono text-5xl font-extrabold tabular-nums tracking-tight">
          {fmtClock(elapsed)}
        </p>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => (running ? clockOut() : clockIn(together))}
          className={cn(
            "mx-auto grid h-32 w-32 place-items-center rounded-full text-[15px] font-bold transition",
            running
              ? "glass-rose shadow-[0_0_0_6px_rgba(255,255,255,0.1),0_0_30px_rgba(255,255,255,0.3)] [animation:var(--animate-pulse-glow)]"
              : "glass",
          )}
        >
          {running ? "Clock out" : "Clock in"}
        </motion.button>
      </div>

      {/* totals */}
      <p className="mb-2.5 ml-1 text-[13px] uppercase tracking-[0.12em] text-faint">
        Total hours studied
      </p>
      <div className="flex gap-3">
        <div className="glass flex-1 rounded-2xl py-4 text-center">
          <p className="text-2xl font-extrabold text-rose-soft">
            {fmtHours(totals[me.id] ?? 0)}h
          </p>
          <p className="mt-1 text-[12.5px] text-muted">{me.name}</p>
        </div>
        <div className="glass flex-1 rounded-2xl py-4 text-center">
          <p className="text-2xl font-extrabold text-mint-soft">
            {partner ? `${fmtHours(totals[partner.id] ?? 0)}h` : "—"}
          </p>
          <p className="mt-1 text-[12.5px] text-muted">{partner?.name ?? "Partner"}</p>
        </div>
      </div>

      {/* history */}
      <p className="mb-1 ml-1 mt-7 text-[13px] uppercase tracking-[0.12em] text-faint">
        History
      </p>
      <div className="glass rounded-2xl px-4">
        {sessions.length === 0 ? (
          <p className="py-8 text-center text-sm text-faint">
            No sessions yet. Clock in to start your streak.
          </p>
        ) : (
          sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between border-b border-white/10 py-3 text-sm last:border-none"
            >
              <span className="text-muted">
                {new Date(s.start).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}{" "}
                · {s.together ? "Together ♥" : "Alone ♡"}
              </span>
              <span className="font-bold tabular-nums">{fmtDur(s.end - s.start)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
