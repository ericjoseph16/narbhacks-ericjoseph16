"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              SkillDrill
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/drills"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                My Drills
              </Link>
              <Link
                href="/progress"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Progress
              </Link>
            </nav>

            <div className="flex items-center space-x-2">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  },
                }}
              />
              <SignOutButton>
                <button
                  type="button"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
