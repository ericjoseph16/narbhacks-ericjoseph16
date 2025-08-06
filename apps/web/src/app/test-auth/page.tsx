import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function TestAuthPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Test
        </h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">User ID:</p>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded">
              {userId}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status:</p>
            <p className="text-lg font-mono bg-gray-100 p-2 rounded">
              Authenticated
            </p>
          </div>
        </div>
        <div className="mt-6">
          <a
            href="/dashboard"
            className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
