/**
 * Supabase Authentication Helper for MedRisQ
 * 
 * Setup instructions:
 * 1. Run: npm install @supabase/supabase-js
 * 2. Go to https://supabase.com → create a project → get your URL and anon key
 * 3. Add to .env (or the platform's environment variables):
 *    VITE_SUPABASE_URL=https://your-project.supabase.co
 *    VITE_SUPABASE_ANON_KEY=your-anon-key-here
 * 4. In Portal.tsx, replace `startLogin()` with `supabaseSignIn()` and 
 *    replace `useAuth()` with `useSupabaseAuth()`.
 *
 * Why Supabase was chosen over Firebase:
 * - The project already uses PostgreSQL + Drizzle ORM — Supabase IS PostgreSQL
 * - Zero database migration cost: connect Supabase to the existing DB
 * - Built-in email/password + OAuth (Google, GitHub) out of the box
 * - Row Level Security (RLS) maps directly to the existing portal role system
 * - TypeScript-first SDK with excellent DX
 */

// ─── Installation ─────────────────────────────────────────────────────────────
// npm install @supabase/supabase-js
// or: pnpm add @supabase/supabase-js

// ─── Client setup ─────────────────────────────────────────────────────────────
// Uncomment the lines below once @supabase/supabase-js is installed:

// import { createClient } from "@supabase/supabase-js";
// import { useCallback, useEffect, useState } from "react";

// const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
// const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
// export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Auth hook (drop-in replacement for useAuth) ──────────────────────────────
// export function useSupabaseAuth() {
//   const [session, setSession] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setSession(data.session);
//       setLoading(false);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       setLoading(false);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);
//
//   const logout = useCallback(async () => {
//     await supabase.auth.signOut();
//     setSession(null);
//   }, []);
//
//   return {
//     user: session?.user ?? null,
//     loading,
//     isAuthenticated: Boolean(session),
//     logout,
//     session,
//   };
// }

// ─── Sign-in trigger ──────────────────────────────────────────────────────────
// export function supabaseSignIn() {
//   // Option A: Email magic link
//   const email = window.prompt("Enter your email for a magic link:");
//   if (email) {
//     supabase.auth.signInWithOtp({ email }).then(({ error }) => {
//       if (error) alert("Sign-in error: " + error.message);
//       else alert("Check your email for a magic link!");
//     });
//   }
//
//   // Option B: Google OAuth (uncomment to use instead)
//   // supabase.auth.signInWithOAuth({ provider: "google" });
// }

// ─── How to integrate with existing tRPC context ──────────────────────────────
// In server/_core/context.ts, replace cookie-based session lookup with:
//
//   import { createClient } from "@supabase/supabase-js";
//   const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
//
//   // In createContext:
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
//   if (token) {
//     const { data: { user }, error } = await supabase.auth.getUser(token);
//     if (!error && user) {
//       // Map Supabase user to your existing User type
//       ctx.user = { id: user.id, email: user.email, openId: user.id, role: "patient" };
//     }
//   }
//
// On the client, pass the token in trpc.ts:
//   const token = (await supabase.auth.getSession()).data.session?.access_token;
//   headers: { Authorization: token ? `Bearer ${token}` : "" }

// ─── Environment variables needed ────────────────────────────────────────────
// Client (.env):
//   VITE_SUPABASE_URL=https://xxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJ...
//
// Server (.env):
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=eyJ...  (service role key — keep secret, server only)

export {};  // Make this a module
