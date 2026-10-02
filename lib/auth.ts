import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Nodemailer({
      // Only used for provider validation; sendVerificationRequest below builds its own
      // transport (or logs to console in dev) and never reads this value.
      server: process.env.EMAIL_SERVER || "smtp://localhost:1025",
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        if (!process.env.EMAIL_SERVER) {
          console.log(`[dev] Sign-in link for ${identifier}: ${url}`);
          return;
        }
        const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);
        await transport.sendMail({
          to: identifier,
          from: process.env.EMAIL_FROM,
          subject: "Sign in to Kindler",
          text: `Sign in to Kindler: ${url}`,
          html: `<p>Sign in to Kindler by clicking <a href="${url}">this link</a>.</p>`,
        });
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
