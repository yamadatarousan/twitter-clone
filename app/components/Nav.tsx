'use client';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Nav() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/tweets" 
              className="text-xl font-bold text-blue-500 hover:text-blue-600 transition"
            >
              Twitter Clone
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Profile
                </Link>
                <span className="text-gray-600">{session.user?.email}</span>
                <button 
                  onClick={() => signOut()} 
                  className="px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className="px-4 py-2 rounded-full border border-blue-500 text-blue-500 hover:bg-blue-50 transition duration-200 text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}