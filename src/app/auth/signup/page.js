"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { FiGithub, FiMail, FiLinkedin, FiEye, FiEyeOff } from "react-icons/fi";

export default function SignUp() {
  const router = useRouter();
  const { signUp, signInWithProvider } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github: "",
    discord: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email is invalid");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting sign up with:', formData.email);
      const { data, error } = await signUp(formData.email, formData.password, {
        data: {
          full_name: formData.name,
          github_username: formData.github,
          discord_username: formData.discord,
        }
      });

      console.log('Sign up response:', { data, error });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        setMessage("Account created successfully! You can now sign in.");
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider) => {
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

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Sign in
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

          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleOAuthSignUp("github")}
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none disabled:opacity-50"
              >
                <FiGithub className="mr-2 h-5 w-5" />
                GitHub
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignUp("google")}
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:opacity-50"
              >
                <FiMail className="mr-2 h-5 w-5" />
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthSignUp("linkedin")}
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                <FiLinkedin className="mr-2 h-5 w-5" />
                LinkedIn
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                  Or sign up with email
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />

                </div>
              </div>

              <div>
                <label
                  htmlFor="github"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  GitHub Username (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="github"
                    name="github"
                    type="text"
                    value={formData.github}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="discord"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Discord Username (Optional)
                </label>
                <div className="mt-1">
                  <input
                    id="discord"
                    name="discord"
                    type="text"
                    value={formData.discord}
                    onChange={handleChange}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-sm bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
