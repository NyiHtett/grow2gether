import { motion } from "framer-motion";
import { CameraIcon, BookIcon, BrainIcon } from "../components/icons";
import type { Route } from "../types";
import type { ComponentType, SVGProps } from "react";
import { auth } from "@/firebase";
import { useState } from "react";
import { signOut } from "firebase/auth";
const FEATURES: {
  route: Route["name"];
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { route: "photos", label: "Photo Dump", Icon: CameraIcon },
  { route: "study", label: "Study", Icon: BookIcon },
  { route: "thoughts", label: "Something I didn't say", Icon: BrainIcon },
];

export function HomeScreen({ go }: { go: (r: Route) => void }) {
  const [link, setLink] = useState<string | null>(null);
  const handleInvite = async() => {
      // create token from firebase
      const token = await auth.currentUser?.getIdToken(); 
      if(!token) {
        console.log("no user is signed in")
      }
  
      // request invite link from backend (authenticate using the token)
      // method, headers, body(along with current userid)
      const res = await fetch("https://grow2gether.onrender.com/api/invite", {
        "method": "POST", 
        "headers": {
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}`, 
        }, 
        "body": JSON.stringify({"uid": auth.currentUser?.uid}) // change for production
      }) 
      
      const data = await res.json()
      setLink("https://grow2gether.onrender.com/invite/"+ "" + data.unique_code)
      // construct sign up link for the other user
    }
  return (
    <div className="flex flex-1 flex-col px-[18px] pb-8">
      <div className="mt-2 grid grid-cols-3 gap-3">
        {FEATURES.map(({ route, label, Icon }, i) => (
          <motion.button
            key={route}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => go({ name: route } as Route)}
            className="glass flex aspect-[1/1.12] flex-col items-center justify-center gap-2.5 rounded-2xl px-2 py-3 text-center transition hover:brightness-125"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-rose/25 to-mint/20">
              <Icon width={22} height={22} />
            </span>
            <span className="text-[12.5px] font-semibold leading-tight">{label}</span>
          </motion.button>
        ))}
      </div>

        <button
        onClick={handleInvite}
        >
          invite
        </button>
      {/* <ConnectionOrb me={me} partner={partner} />

      {!partner && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => go({ name: "invite" })}
          className="glass-mint mb-5 w-full rounded-2xl py-3.5 text-[15px] font-semibold text-white"
        >
          Invite your partner
        </motion.button>
      )} */}
      <div className="flex flex-row gap-2">
        <div> {link} </div>
        <button onClick = {() => {
          navigator.clipboard.writeText(link || "")
        }}> Copy </button> 
        <button onClick = {() => {
          signOut(auth)
        }}
        > Log Out </button>
      </div>
      
    </div>
  );
}
