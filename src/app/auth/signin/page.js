"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { FiGithub, FiMail, FiLinkedin, FiEye, FiEyeOff } from "react-icons/fi";

export default function SignIn() {
  const router = useRouter();
  const { signIn, signInWithProvider } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection test:', { data, error });
      } catch (err) {
        console.error('Supabase connection error:', err);
      }
    };
    testConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithProvider(provider);

      if (error) {
        setError(error.message);
      }
      // OAuth redirect will handle the rest
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Test function to create a user directly
  const createTestUser = async () => {
    setLoading(true);
    setError("");

    try {
      console.log('Creating test user...');
      const { data, error } = await supabase.auth.signUp({
        email: 'testuser' + Date.now() + '@gmail.com',
        password: 'testpassword123',
        options: {
          emailRedirectTo: undefined // Skip email confirmation
        }
      });
      console.log('Test user creation result:', { data, error });

      if (error) {
        setError(`Test user creation failed: ${error.message}`);
      } else {
        setError(`Test user created successfully! Check console for email.`);
      }
    } catch (err) {
      console.error('Test user creation error:', err);
      setError("Test user creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:text-primary-dark"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Test button for debugging */}
          <div className="mb-4">
            <button
              onClick={createTestUser}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50"
            >
              🧪 Create Test User (Random Email)
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <button
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none disabled:opacity-50"
              >
                <FiGithub className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </button>
            </div>

            <div>
              <button
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                <FiMail className="mr-2 h-5 w-5" />
                Sign in with Google
              </button>
            </div>

            <div>
              <button
                onClick={() => handleOAuthSignIn("linkedin")}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                <FiLinkedin className="mr-2 h-5 w-5" />
                Sign in with LinkedIn
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-medium text-primary hover:text-primary-dark"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/signup" className="font-medium text-primary hover:text-primary-dark">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
