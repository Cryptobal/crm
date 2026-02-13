/**
 * Auth.js v5 (NextAuth v5) - Gard Docs
 * Credentials con tabla Admin (bcrypt) + tenantId en sesión
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    roleTemplateId?: string | null;
    tenantId: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      roleTemplateId?: string | null;
      tenantId: string;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: string;
    roleTemplateId?: string | null;
    tenantId: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        const admin = await prisma.admin.findUnique({
          where: { email },
          include: { tenant: true },
        });
        
        // Verificar que existe y está activo
        if (!admin || admin.status !== 'active') return null;

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return null;

        // Actualizar último login
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          roleTemplateId: admin.roleTemplateId,
          tenantId: admin.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleTemplateId = user.roleTemplateId ?? null;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.roleTemplateId = token.roleTemplateId ?? null;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/opai/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días (gold standard SaaS B2B)
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

/**
 * Helper para actualizar último login
 */
export async function updateLastLogin(userId: string) {
  await prisma.admin.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}
