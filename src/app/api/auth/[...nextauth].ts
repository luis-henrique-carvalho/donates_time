import { cookies } from "next/headers";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import type { NextAuthOptions, SessionOptions } from "next-auth";
import { encode, decode } from "next-auth/jwt";
import type { Adapter } from "next-auth/adapters";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const getAdapter = (req: NextApiRequest, res: NextApiResponse): Adapter => ({
  ...PrismaAdapter(prisma),
  async getSessionAndUser(sessionToken) {
    const userAndSession = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (!userAndSession) return null;

    const { user, ...session } = userAndSession;
  },
});

const session: SessionOptions = {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
  generateSessionToken: async () => randomUUID(),
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const adapter = getAdapter(req, res);
  const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          name: { label: "Name", type: "name", placeholder: "Name" },
          email: { label: "Email", type: "email", placeholder: "Email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          if (!credentials) return null;
          const { name, email, password } = credentials;

          let user = await prisma.user.findUnique({ where: { email } });
          if (!user && !!name && !!email && !!password) {
            // sign up
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
              data: { email, password: hashedPassword },
            });
          } else {
            user = await prisma.user.findUnique({ where: { email } });
            if (
              !user ||
              !user.password ||
              !bcrypt.compareSync(password, user.password)
            )
              return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          };
        },
      }),
    ],
    adapter,
    callbacks: {
      async session({ session, user }) {
        if (session.user) {
          session.user.id = user.id;
        }
        return session;
      },
      async signIn({ user }) {
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          if (user && "id" in user) {
            const sessionToken = randomUUID();
            const sessionExpiry = new Date(Date.now() + session.maxAge! * 1000);

            if (!adapter.createSession) return false;
            await adapter.createSession({
              sessionToken,
              userId: user.id,
              expires: sessionExpiry,
            });

            cookies().set("next-auth.session-token", sessionToken, {
              expires: sessionExpiry,
            });
          }
        }

        return true;
      },
    },
    jwt: {
      maxAge: session.maxAge,
      async encode(params) {
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          const cookieStore = cookies();
          const cookie = cookieStore.get("next-auth.session-token");

          if (cookie) return cookie;
          else return "";
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return encode(params);
      },
      async decode(params) {
        if (
          req.query.nextauth?.includes("callback") &&
          req.query.nextauth?.includes("credentials") &&
          req.method === "POST"
        ) {
          return null;
        }
        // Revert to default behaviour when not in the credentials provider callback flow
        return decode(params);
      },
    },
    pages: {
      signIn: "/account/signin",
    },
    session,
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    debug: process.env.NODE_ENV === "development",
  };

  return NextAuth(req, res, authOptions);
}