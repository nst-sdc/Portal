"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [role, setRole] = useState("admin");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      router.push(role === 'admin' ? '/dashboard' : '/member');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4">
      <div className="w-full max-w-md space-y-8 glass-card">
        <div className="text-center space-y-2">
          <Image src="/logo.png" alt="NST Dev Club" width={72} height={72} className="mx-auto pulse-subtle" />
          <h1 className="text-3xl font-bold gradient-text">NST Dev Club Portal</h1>

          <div className="inline-flex rounded-md overflow-hidden border border-gray-700 mt-4">
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`px-4 py-1 text-sm font-medium transition-colors ${
                role === 'admin' ? 'bg-primary text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`px-4 py-1 text-sm font-medium transition-colors ${
                role === 'member' ? 'bg-primary text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'
              }`}
            >
              Member Login
            </button>
          </div>
          <p className="text-gray-400 text-sm">Sign in to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loginLoading}
            className="btn-primary w-full flex justify-center py-2"
          >
            {loginLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>


        <p className="text-center text-xs text-gray-500 pt-4">
          New here? <Link href="/auth/signup" className="text-primary hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
