import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import type { Route } from "./types";
import { AppBar } from "./components/AppBar";
import { IntroScreen } from "./screens/IntroScreen";
import { RegisterScreen } from "./screens/AuthScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { PhotoDumpScreen } from "./screens/PhotoDumpScreen";
import { StudyScreen } from "./screens/StudyScreen";
import { ThoughtsScreen } from "./screens/ThoughtsScreen";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";

function Router() {
  const [user, setUser] = useState<User | null> (null); 
  const [route, setRoute] = useState<Route>({ name: "home" });
  const go = (r: Route) => setRoute(r);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // stores the data from the url
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/invite\/(.+)$/)
    if(match) {
      console.log(match[1])
      setInviteCode(match[1])
    }
    
  }, [])

  // Not registered yet → force the register screen (no app bar).
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); 
    })
    return unsubscribe; 
  }, [])

  if(!user) {
    return (
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col border-x border-white/10">
        <RegisterScreen go={go} inviteCode={inviteCode}/>
      </div>
    );
  }
    

  const onSubScreen = route.name !== "home";

  return (
    <div className="no-scrollbar mx-auto flex min-h-[100svh] w-full max-w-[480px] flex-col border-x border-white/10">
      <AppBar photoURL={auth.currentUser?.photoURL} onBack={onSubScreen ? () => go({ name: "home" }) : undefined} />
      {route.name === "home" && <HomeScreen go={go} />}
      {route.name === "invite" && <InviteScreen go={go} />}
      {route.name === "photos" && <PhotoDumpScreen />}
      {route.name === "study" && <StudyScreen />}
      {route.name === "thoughts" && <ThoughtsScreen />}
      {route.name === "auth" && <InviteScreen go={go} />}
    </div>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  return (

      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroScreen key="intro" onDone={() => setShowIntro(false)} />
        ) : (
          <Router key="app" />
        )}
      </AnimatePresence>
  );
}
