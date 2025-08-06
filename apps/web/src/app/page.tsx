import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // If user is signed in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">SkillDrill</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/sign-in"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Master Your Skills with Daily Drills
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get personalized skill improvement drills for sports, music, art,
            coding, and more. Track your progress and stay motivated with daily
            challenges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="bg-blue-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
