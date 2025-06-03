"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FiHome,
  FiUsers,
  FiCode,
  FiCalendar,
  FiAward,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiMoon,
  FiSun
} from "react-icons/fi";

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled in local storage or system preference
    const isDarkMode = localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setDarkMode(isDarkMode);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  
  // Navigation items
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: FiHome },
    { name: "Projects", href: "/projects", icon: FiCode },
    { name: "Students", href: "/students", icon: FiUsers },
    { name: "Meetings", href: "/meetings", icon: FiCalendar },
  ];
  
  // Admin-only navigation items
  const adminNavItems = [
    { name: "New Project", href: "/projects/new", icon: FiCode },
    { name: "Schedule Meeting", href: "/meetings/new", icon: FiCalendar },
  ];
  
  return (
    <header className="card border-0 rounded-none backdrop-blur-lg bg-black/20 border-b border-cyan-500/30 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Futuristic Logo and brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center group">
              <div className="relative">
                <span className="text-3xl font-black neon-blue tracking-wider">NST</span>
                <span className="text-xl font-bold text-gray-400 ml-2">DEV CLUB</span>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm text-white font-medium ${
                  pathname === item.href || pathname?.startsWith(item.href + "/")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {/* Futuristic Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
            </button>

            {/* Futuristic User dropdown */}
            {user ? (
              <div className="relative group z-50">
                <button className="flex items-center space-x-3 p-2 rounded-lg border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300 focus:outline-none">
                  <div className="relative">
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://i.pravatar.cc/150?img=1"}
                      alt={user.user_metadata?.full_name || user.email}
                      className="h-10 w-10 rounded-full border-2 border-purple-500"
                    />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">ONLINE</div>
                  </div>
                </button>

                {/* Futuristic Dropdown menu */}
                <div className="dropdown-menu absolute right-0 mt-2 w-56 card border border-purple-500/30 backdrop-blur-lg bg-black/80 py-2 hidden group-hover:block" style={{zIndex: 9999}}>
                  <div className="px-4 py-2 border-b border-purple-500/20">
                    <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">USER MENU</div>
                  </div>

                  <Link
                    href={`/students/${user.id}`}
                    className="block px-4 py-3 text-sm text-gray-300 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    <div className="flex items-center">
                      <FiUser className="mr-3 h-4 w-4" />
                      <span className="font-medium">MY PROFILE</span>
                    </div>
                  </Link>

                  {/* Admin-only links */}
                  {user.email && (
                    <>
                      <div className="px-4 py-2 border-t border-purple-500/20">
                        <div className="text-xs text-gray-400 font-mono uppercase tracking-wider">ADMIN TOOLS</div>
                      </div>
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-3 text-sm text-gray-300 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-300"
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-3 h-4 w-4" />
                            <span className="font-medium">{item.name.toUpperCase()}</span>
                          </div>
                        </Link>
                      ))}
                    </>
                  )}

                  <div className="border-t border-red-500/20 mt-2">
                    <button
                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                      onClick={() => signOut()}
                    >
                      <div className="flex items-center">
                        <FiLogOut className="mr-3 h-4 w-4" />
                        <span className="font-medium">DISCONNECT</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="btn-secondary px-6 py-2 text-sm font-bold"
              >
                CONNECT
              </Link>
            )}
          </div>

          {/* Futuristic Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 focus:outline-none"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href || pathname?.startsWith(item.href + "/")
                    ? "bg-primary text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="mr-2 h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* Admin-only links */}
            {user?.email && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                  <p className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                {adminNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </div>
          
          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://i.pravatar.cc/150?img=1"}
                      alt={user.user_metadata?.full_name || user.email}
                      className="h-10 w-10 rounded-full"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                      {user.user_metadata?.full_name || user.email}
                    </div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="ml-auto p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                  </button>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href={`/students/${user.id}`}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <FiUser className="mr-2 h-5 w-5" />
                    My Profile
                  </Link>
                  <button
                    className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => signOut()}
                  >
                    <FiLogOut className="mr-2 h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4">
                <Link
                  href="/auth/signin"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
