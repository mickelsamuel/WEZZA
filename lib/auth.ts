import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import {
  isAccountLocked,
  lockAccount,
  trackFailedLogin,
  clearFailedLoginAttempts,
} from "./security";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // SECURITY: Check if account is locked
        const lockedUntil = await isAccountLocked(credentials.email);
        if (lockedUntil) {
          const minutesRemaining = Math.ceil(
            (lockedUntil.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Account is locked due to too many failed login attempts. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`
          );
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          // SECURITY: Track failed login attempt (even for non-existent users to prevent enumeration)
          const loginTrack = trackFailedLogin(credentials.email);
          if (loginTrack.shouldLock) {
            // Only lock if user exists
            if (user) {
              await lockAccount(credentials.email);
            }
          }
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          // SECURITY: Track failed login attempt
          const loginTrack = trackFailedLogin(credentials.email);
          if (loginTrack.shouldLock) {
            await lockAccount(credentials.email);
            throw new Error(
              "Account has been locked due to too many failed login attempts. Please try again in 15 minutes."
            );
          }
          throw new Error("Invalid credentials");
        }

        // SECURITY: Clear failed login attempts on successful login
        clearFailedLoginAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  // SECURITY: Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  // SECURITY: Cookie configuration for session security
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
