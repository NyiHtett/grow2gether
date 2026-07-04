// Grow2Gether — domain types
// Frontend-only for now; these mirror what the backend will store later.

export type PersonColor = "rose" | "mint";

export interface Person {
  id: string;
  name: string;
  color: PersonColor;
  avatar?: string; // data URL for now
}

export type ConnectionState = "solo" | "connected";

export interface Photo {
  id: string;
  dataUrl: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  authorId: string;
  caption?: string;
  createdAt: number;
}

export interface StudySession {
  id: string;
  personId: string;
  start: number;
  end: number; // closed sessions only live in history
  together: boolean;
}

export interface Thought {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: number;
}

export interface AppData {
  me: Person | null;
  partner: Person | null;
  inviteCode: string | null;
  photos: Photo[];
  sessions: StudySession[];
  /** currently-running session (clocked in, not yet out) */
  activeSession: Omit<StudySession, "end"> | null;
  thoughts: Thought[];
}

export type Route =
  | { name: "auth" }
  | { name: "invite" }
  | { name: "home" }
  | { name: "photos" }
  | { name: "study" }
  | { name: "thoughts" };
