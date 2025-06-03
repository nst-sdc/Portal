import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "NST Dev Club Portal",
  description: "A platform for NST Dev Club members to track projects, earn rewards, and collaborate with fellow developers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          {/* Skip Navigation component on the homepage as it has its own layout */}
          {/* We'll conditionally render it in client components that need it */}
          <main className="flex-grow">{children}</main>
          
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    © {new Date().getFullYear()} NST Dev Club. All rights reserved.
                  </p>
                </div>
                <div className="flex space-x-4">
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
                    Terms of Service
                  </a>
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
