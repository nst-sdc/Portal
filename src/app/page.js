"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { FiCode, FiUsers, FiAward, FiCalendar, FiArrowRight } from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect to dashboard if authenticated
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or while waiting for redirect, show landing page
  if (!user) {
  return (
    <div className="flex flex-col gap-16">
      {/* Futuristic Hero Section */}
      <section className="relative z-10 matrix-bg text-center py-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="block text-gray-300">Welcome to</span>
            <span className="block gradient-text text-6xl md:text-8xl font-black tracking-tight">
              NST Dev Club
            </span>
          </h1>

          <div className="mx-auto max-w-3xl mb-12">
            <p className="text-xl md:text-2xl text-gray-400 font-mono">
              Building the future, one line of code at a time
            </p>
          </div>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
            Join our <span className="accent-violet font-semibold">community</span> of passionate developers.
            Learn <span className="accent-emerald font-semibold">modern technologies</span>, build
            <span className="accent-rose font-semibold">innovative projects</span>, and grow your skills
            in a <span className="accent-primary font-semibold">collaborative environment</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/signin"
              className="btn-primary px-8 py-3 text-lg font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/projects"
              className="btn-secondary px-8 py-3 text-lg font-semibold"
            >
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">Key Features</h2>
          <p className="text-center text-gray-400 mb-16">Everything you need to succeed as a developer</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card flex flex-col items-center text-center p-8 group">
              <div className="mb-6 p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <FiCode className="h-8 w-8 accent-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Project Showcase</h3>
              <p className="text-gray-400 leading-relaxed">
                Build and showcase your <span className="accent-emerald font-semibold">innovative projects</span> with the community.
              </p>
            </div>

            <div className="card flex flex-col items-center text-center p-8 group">
              <div className="mb-6 p-4 rounded-full bg-violet-500/10 border border-violet-500/20">
                <FiUsers className="h-8 w-8 accent-violet" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Developer Network</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect with <span className="accent-violet font-semibold">talented developers</span> and collaborate on projects.
              </p>
            </div>

            <div className="card flex flex-col items-center text-center p-8 group">
              <div className="mb-6 p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <FiAward className="h-8 w-8 accent-emerald" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Achievement System</h3>
              <p className="text-gray-400 leading-relaxed">
                Earn <span className="accent-emerald font-semibold">recognition</span> for your contributions and milestones.
              </p>
            </div>

            <div className="card flex flex-col items-center text-center p-8 group">
              <div className="mb-6 p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
                <FiCalendar className="h-8 w-8 accent-orange" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Event Management</h3>
              <p className="text-gray-400 leading-relaxed">
                Join <span className="accent-orange font-semibold">workshops and meetups</span> to enhance your skills.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 gradient-text">Club Statistics</h2>
          <p className="text-center text-gray-400 mb-16">Growing stronger every day</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="card text-center p-8">
              <div className="text-5xl font-bold accent-primary mb-4">25+</div>
              <div className="text-gray-400 font-medium">
                Active Projects
              </div>
            </div>

            <div className="card text-center p-8">
              <div className="text-5xl font-bold accent-violet mb-4">100+</div>
              <div className="text-gray-400 font-medium">
                Club Members
              </div>
            </div>

            <div className="card text-center p-8">
              <div className="text-5xl font-bold accent-emerald mb-4">500+</div>
              <div className="text-gray-400 font-medium">
                Code Commits
              </div>
            </div>

            <div className="card text-center p-8">
              <div className="text-5xl font-bold accent-orange mb-4">50+</div>
              <div className="text-gray-400 font-medium">
                Weekly Meetings
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 gradient-text">Ready to Join?</h2>
          <p className="text-xl max-w-3xl mx-auto mb-12 text-gray-400 leading-relaxed">
            Start your journey with the NST Dev Club today.
            Connect with <span className="accent-violet font-semibold">talented developers</span>,
            work on <span className="accent-emerald font-semibold">exciting projects</span>,
            and grow your <span className="accent-primary font-semibold">technical skills</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/auth/signin"
              className="btn-primary px-8 py-3 text-lg font-semibold"
            >
              <span className="flex items-center">
                Join Now <FiArrowRight className="ml-2" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
  }
  
  return null; // This will not be reached as we either show loading, redirect to dashboard, or show landing page
}
