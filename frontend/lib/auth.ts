import GitHubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || ""
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "github") {
        return false;
      }

      const githubLogin = typeof profile?.login === "string" ? profile.login : "";
      return githubLogin.toLowerCase() === "lukewain";
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET
};
