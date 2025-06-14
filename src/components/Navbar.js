"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiUser, FiSun, FiMoon } from "react-icons/fi";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // This would be replaced with actual auth state
  const isLoggedIn = false;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    // In a real implementation, this would toggle the theme
    setIsDarkMode(!isDarkMode);
    // Add actual theme switching logic here
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-primary font-bold text-xl">NST Dev Club</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/projects"
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/students"
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Students
              </Link>
              <Link
                href="/rewards"
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Rewards
              </Link>
              <Link
                href="/meetings"
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Meetings
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-500 hover:text-primary focus:outline-none"
            >
              {isDarkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <Link
                href="/profile"
                className="ml-3 p-1 rounded-full text-gray-500 hover:text-primary focus:outline-none"
              >
                <FiUser className="h-6 w-6" />
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none"
              >
                Sign in
              </Link>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/projects"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary"
            >
              Projects
            </Link>
            <Link
              href="/students"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary"
            >
              Students
            </Link>
            <Link
              href="/rewards"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary"
            >
              Rewards
            </Link>
            <Link
              href="/meetings"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-primary hover:text-primary"
            >
              Meetings
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center px-4">
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Profile
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
