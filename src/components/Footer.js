"use client";

import Link from "next/link";
import { FiGithub, FiMail, FiInfo } from "react-icons/fi";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6">
            <a
              href="https://github.com/nst-dev-club"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary"
            >
              <span className="sr-only">GitHub</span>
              <FiGithub className="h-5 w-5" />
            </a>
            <a
              href="mailto:contact@nstdevclub.org"
              className="text-gray-500 hover:text-primary"
            >
              <span className="sr-only">Email</span>
              <FiMail className="h-5 w-5" />
            </a>
            <Link
              href="/about"
              className="text-gray-500 hover:text-primary"
            >
              <span className="sr-only">About</span>
              <FiInfo className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 md:mt-0">
            <p className="text-center md:text-right text-sm text-gray-500">
              &copy; {currentYear} NST Dev Club. All rights reserved.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-center md:justify-start space-x-6">
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-sm text-gray-500 hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/contact" className="text-sm text-gray-500 hover:text-primary">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
