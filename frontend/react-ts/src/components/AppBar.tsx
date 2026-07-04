
import { useEffect, useState } from "react";
import { AvatarPair } from "./AvatarPair";
import { GrowArrows, ChevronLeft } from "./icons";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/firebase";

export function AppBar({ photoURL, onBack }: { photoURL: string; onBack?: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 px-[18px] py-3.5 backdrop-blur-xl bg-ink-0/70">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[15px] text-muted active:text-cream"
        >
          <ChevronLeft width={20} height={20} />
          Back
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <GrowArrows width={24} height={24} className="text-white" />
          <h1 className="text-xl font-bold tracking-tight text-white">
            Grow2Gether
          </h1>
        </div>
      )}

      {/* authentication pair */}
      { photoURL &&
        <img src={photoURL} className="h-8 w-8 rounded-full"/>
      }
      {/* <AvatarPair me={user} partner={partner} /> */}
    </header>
  );
}
