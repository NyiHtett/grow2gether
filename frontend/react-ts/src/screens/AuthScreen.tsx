import { motion } from "framer-motion";
import { GrowArrows } from "../components/icons";

// we get two things: auth and signInWithEmailAndPassword for users
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import type { Route } from "@/types";



/** Step 1 — register yourself (shown full-screen when nobody is logged in). */
export function RegisterScreen({go, inviteCode}: {go: (r: Route) => void; inviteCode: string | null}) {
  

  const handleGoogleSignIn = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  // code for searching the partner
  if(inviteCode) {
    const token = await result.user.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invite/accept/${inviteCode}`, {
      "method" : 'POST', 
      "headers" : {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    const data = await res.json(); 
    console.log("the two users are paired", data); 
  }
  go({name: "home"});
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-1 flex-col justify-center px-6 py-8"
    >
      <div className="mb-1 flex items-center justify-center">
        <GrowArrows width={30} height={30} className="text-white" />
      </div>
      <h1 className="text-center text-3xl font-bold text-white">
        Grow2Gether
      </h1>
      <p className="mb-7 mt-1.5 text-center text-sm text-muted">
        A little space for two people to grow.
      </p>

      <button
        // this is when the user signs in
        onClick={handleGoogleSignIn}
        className="glass-rose w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-40"
      >
        Sign In With Google
      </button>
    </motion.div>
  );
}
