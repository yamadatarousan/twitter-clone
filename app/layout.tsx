import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <html lang="ja">
      <body>
        <nav className="p-4 bg-gray-100">
          <Link href="/tweets" className="mr-4">Tweets</Link>
          {session ? (
            <>
              <span className="mr-4">{session.user?.email}</span>
              <button onClick={() => signOut()} className="text-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="mr-4">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </nav>
        {children}
      </body>
    </html>
  );
}