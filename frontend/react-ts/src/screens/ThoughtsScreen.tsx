import { useEffect, useRef, useState } from "react";
import { SendIcon } from "../components/icons";
import { auth } from "../firebase";
import { socket } from "../socket";
import type { Thought } from "@/types";
// import { motion } from "framer-motion";
// import { cn } from "@/lib/cn";


export function ThoughtsScreen() {
  const user = auth.currentUser;
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });

    socket?.on('new_thought', (thought) => {
    setThoughts((prev) => [...prev, thought]);
    });

    const fetchThoughts = async () => {
      try {
        const user_data = await auth.currentUser?.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/getThoughts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user_data}`,
          },
        });
        const data = await response.json();
        console.log("Fetched thoughts:", data);
        setThoughts(data);
      }
      catch (error) {
        console.error("Error fetching thoughts:", error);
      }
    }

    fetchThoughts();

    return () => {
      socket?.off('new_thought')
    }
  }, []);

  

  const submit = async () => {
    console.log("submit function called with text:", text);
    if (!text.trim()) return;
    const token = await user?.getIdToken();
    console.log("User token:", token);
    console.log("sending thought", text);

    if (user) {
      console.log("User is signed in:", user.uid);
    }
    else {
      console.log("No user is signed in.");
    }
    
    let userData: any = null; 
    try {
      console.log("started fetching user's pairID")
      const userObject = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${user?.uid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      userData = await userObject.json();
      console.log("User data:", userData);

    }
    catch (error) {
      console.error("Error fetching user data:", error);
    }
    
    const result = await fetch(`${import.meta.env.VITE_API_URL}/sendThought`, {
      "method": 'POST',
      "headers": {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      "body": JSON.stringify({ "thought": text})
    })
    const data = await result.json()
    console.log(data)
    setText("");
    thoughts.push(data.thought); // Update the thoughts state with the new thought
  };

  return (
    <div className="flex flex-1 flex-col px-[18px]">
      <div className="flex flex-1 flex-col gap-3.5 pb-3 pt-4">
        {thoughts.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-faint">
            Things you didn't get to say out loud — leave them here.
          </p>
        ) : (
          thoughts.map((t) => {
            return (
              
              <div key={t.createdAt} className="flex flex-col gap-3 rounded-lg border p-3.5 border-white/15 bg-black/25 m-3">
              
              <div className="flex items-end gap-2.5 text-sm text-faint">
                
              {/* <span> {t.name} </span> */}
              <span> {new Date().toLocaleString([], {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })} </span>
              </div>
              <span className=""> {t.thought} </span>
              

              
              <div className="flex justify-end">
              <img src={t.photoUrl} alt="User photo" className="w-10 h-10 rounded-full " />
              </div>
              </div>
            );
          })
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
