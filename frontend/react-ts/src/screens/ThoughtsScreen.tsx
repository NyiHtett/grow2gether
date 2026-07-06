import { useEffect, useRef, useState } from "react";
import { SendIcon } from "../components/icons";
import { auth } from "../firebase";   


export function ThoughtsScreen() {
  const user = auth.currentUser;
  const thoughts: string[]= []
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thoughts.length]);


  const submit = async () => {
    if (!text.trim()) return;
    const token = user?.getIdToken();
    console.log("sending thought", text);

    if(user) {
      console.log("User is signed in:", user.uid);
    }
    else {
      console.log("No user is signed in.");
    }
    const result = await fetch(`${import.meta.env.VITE_API_URL}/sendThought/${text}`, {
         "method" : 'POST', 
         "headers" : {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
         },
    })
    const data = await result.json()
    console.log(data)
    setText("");
  };

  return (
    <div className="flex flex-1 flex-col px-[18px]">
      <div className="flex flex-1 flex-col gap-3.5 pb-3 pt-4">
        {thoughts.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-faint">
            Things you didn't get to say out loud — leave them here.
          </p>
        ) : (
          // thoughts.map((t) => {
          //   const mine = t.authorId === me.id;
          //   return (
          //     <motion.div
          //       key={t.id}
          //       initial={{ opacity: 0, y: 8 }}
          //       animate={{ opacity: 1, y: 0 }}
          //       className={cn(
          //         "max-w-[85%] rounded-2xl border p-3.5",
          //         mine
          //           ? "self-end rounded-br-md border-rose/30 bg-gradient-to-br from-rose/20 to-rose/10"
          //           : "self-start rounded-bl-md border-mint/30 bg-gradient-to-br from-mint/[0.18] to-mint/[0.08]",
          //       )}
          //     >
          //       <p className="mb-1.5 text-[11px] text-faint">
          //         {fmtWhen(t.createdAt)} · {t.authorName}
          //       </p>
          //       <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{t.text}</p>
          //     </motion.div>
          //   );
          // })
          <div> </div>
        )}
        <div ref={endRef} />
      </div>

      {/* composer */}
      <div className="sticky bottom-0 flex items-end gap-2.5 bg-gradient-to-b from-transparent to-ink-0 pb-4 pt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Send a thought…"
          className="max-h-28 flex-1 resize-none rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-[15px] leading-snug outline-none focus:border-rose-soft"
        />
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="glass-rose grid h-11 w-11 flex-none place-items-center rounded-full text-white transition active:scale-95 disabled:opacity-40"
          aria-label="Send"
        >
          <SendIcon width={20} height={20} />
        </button>
      </div>
    </div>
  );
}
