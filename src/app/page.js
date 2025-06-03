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
      {/* Hero Section */}
      <section className="text-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to NST Dev Club Portal</h1>
        <p className="text-xl max-w-3xl mx-auto mb-8">
          A platform for NST Dev Club members to track projects, earn rewards, and collaborate with fellow developers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/auth/signin"
            className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-lg inline-flex items-center"
          >
            Get Started <FiArrowRight className="ml-2" />
          </Link>
          <Link
            href="/projects"
            className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium text-lg"
          >
            Explore Projects
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card flex flex-col items-center text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <FiCode className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Project Showcase</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Showcase your projects and discover what others are building within the club.
            </p>
          </div>

          <div className="card flex flex-col items-center text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <FiUsers className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Student Profiles</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect with fellow developers and view their GitHub activity and achievements.
            </p>
          </div>

          <div className="card flex flex-col items-center text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <FiAward className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reward System</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Earn points for your contributions, issue solving, and project ideas.
            </p>
          </div>

          <div className="card flex flex-col items-center text-center p-6">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              <FiCalendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Meeting Tracker</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Schedule meetings, track attendance, and earn points for participation.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Club Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-primary">25+</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Active Projects</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">100+</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Club Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Pull Requests</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">50+</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Weekly Meetings</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Join?</h2>
        <p className="text-xl max-w-3xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
          Sign up today and start collaborating with fellow developers in the NST Dev Club.
        </p>
        <Link
          href="/auth/signin"
          className="btn-primary text-lg px-8 py-3 rounded-md inline-flex items-center"
        >
          Sign Up Now <FiArrowRight className="ml-2" />
        </Link>
      </section>
    </div>
  );
  }
  
  return null; // This will not be reached as we either show loading, redirect to dashboard, or show landing page
}
