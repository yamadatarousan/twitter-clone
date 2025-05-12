import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [
          credentials.email,
        ]);
        const user = (rows as any[])[0];
        if (!user || !(await bcrypt.compare(credentials.password, user.password))) return null;
        console.log('Authorized user:', { id: user.id.toString(), email: user.email });
        return { id: user.id.toString(), email: user.email };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        console.log('JWT token:', token);
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = session.user || {};
      if (token.id) {
        session.user.id = token.id;
      }
      if (token.email) {
        session.user.email = token.email;
      }
      console.log('Session:', session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };