import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to SkillDrill
            </h1>
            <p className="text-gray-600 mb-6">
              Your personal skill improvement assistant. Get daily drills, track
              your progress, and master new skills.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Skill Categories
                </h3>
                <p className="text-blue-700">
                  Choose from sports, music, art, coding, and more.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  Daily Drills
                </h3>
                <p className="text-green-700">
                  Get personalized drills based on your skill level.
                </p>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">
                  Progress Tracking
                </h3>
                <p className="text-purple-700">
                  Monitor your improvement over time.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700">
                  Get Today's Drill
                </button>
                <button className="bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700">
                  View Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
