import { useEffect } from "react";
import { motion } from "framer-motion";
import { TextMarquee } from "@/components/ui/text-marquee";
import { GrowArrows } from "../components/icons";

// The marquee centers index 2 first, then 3, 0, 1. Order the array so the
// *centered* sequence reads Grow → Photo Dump → Study → Understand → (loops).
const WORDS = ["Study", "Understand", "Grow", "Photo Dump"];
const textStyle = "text-white";

export function IntroScreen({ onDone }: { onDone: () => void }) {
  // End right after "Understand Together" is centered (~8.2s into the 9.6s
  // cycle), before it loops back to Grow. Tapping skips early.
  useEffect(() => {
    const t = setTimeout(onDone, 8200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      onClick={onDone}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
      className="mx-auto flex min-h-[100svh] w-full max-w-[480px] cursor-pointer flex-col items-center justify-center gap-8 bg-black px-6"
    >
      <GrowArrows width={44} height={44} className="text-white" />

      {/* rotating word inline with a fixed "Together" (demo prefix-style usage) */}
      <div className="flex items-center justify-center gap-2 text-3xl font-extrabold tracking-tight">
        <TextMarquee height={120} speed={2.4} className="text-3xl font-extrabold">
          {WORDS.map((w) => (
            <span
              key={w}
              className={`block w-[10ch] whitespace-nowrap text-right ${textStyle}`}
            >
              {w}
            </span>
          ))}
        </TextMarquee>
        <span className={`whitespace-nowrap ${textStyle}`}>Together</span>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="text-[13px] text-white/40"
      >
        tap to continue
      </motion.p>
    </motion.div>
  );
}
