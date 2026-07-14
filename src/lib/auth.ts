import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getActiveBan } from "@/lib/moderation";

class BannedError extends CredentialsSignin {
  code = "banned";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const activeBan = await getActiveBan(user.id);
        if (activeBan) throw new BannedError();

        // Rollback: se a conta tinha sido marcada como eliminada, voltar a
        // iniciar sessão reativa-a automaticamente (recupera a conta).
        if (user.deletedAt) {
          await prisma.user.update({
            where: { id: user.id },
            data: { deletedAt: null },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = (user as { id?: string }).id;
      }
      if (token.id) {
        const activeBan = await getActiveBan(token.id as string);
        token.banned = !!activeBan;
        // Sessões de contas eliminadas (soft-delete) deixam de ser válidas.
        const account = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { deletedAt: true },
        });
        token.deleted = !!account?.deletedAt;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.banned || token.deleted) {
        return { ...session, user: undefined } as unknown as typeof session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
