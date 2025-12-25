import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers";
import { db } from "@/db";

const FRONTEND_URL = "https://gleeful-stardust-6f03ef.netlify.app";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Optional: specify redirect path if your Better Auth version requires it
      redirectUri: `${process.env.BACKEND_URL || "https://packinsight-b8ah.onrender.com"}/api/auth/google/callback`,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [bearer()],
  trustedOrigins: [
    "http://localhost:3000",  // local dev
    FRONTEND_URL,             // Netlify frontend
    "https://packinsight-b8ah.onrender.com" // Render backend
  ],
  cookie: {
    secure: true,       // required for cross-domain cookies
    sameSite: "none",   // allow frontend to read the session
    domain: undefined,  // do not lock to Render domain
  },
  // After login, redirect user to frontend
  redirect: {
    afterSignIn: `${FRONTEND_URL}/dashboard`,
    afterSignOut: `${FRONTEND_URL}/login`,
  },
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}
