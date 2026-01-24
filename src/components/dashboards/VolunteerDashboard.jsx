"use client";
import { useRouter } from "next/navigation";
import { useDashboardData } from "./useDashboardData";
import NavBar from "@/components/NavBar";
import { FiActivity, FiUsers, FiAward, FiDownload } from "react-icons/fi";

export default function VolunteerDashboard() {
  const router = useRouter();
  const { dashboardData, isLoading, user } = useDashboardData();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="flex items-center justify-center pt-20 pb-8 min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-20 lg:pt-32 pb-8 px-2">
        <div className="max-w-full mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-green-100">
              Check your volunteer activities and certificates
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Hours Volunteered</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <FiActivity className="text-4xl text-orange-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Events Attended</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <FiUsers className="text-4xl text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Certificates</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <FiAward className="text-4xl text-blue-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">My Volunteer ID Card</h3>
                  <p className="text-gray-600">View and download your volunteer identification card</p>
                </div>
                <button
                  onClick={() => router.push("/my-volunteer-card")}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition flex items-center gap-2 font-semibold shadow-lg"
                >
                  <FiDownload size={20} />
                  View ID Card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
