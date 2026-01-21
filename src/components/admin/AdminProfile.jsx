"use client";
import { useState } from "react";

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile</h1>
        <nav className="text-gray-500 text-sm">
          <ol className="flex space-x-2 items-center">
            <li><a href="/admin" className="hover:underline text-gray-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-700">Profile</li>
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-blue-600">CA</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carefoundation Admin</h2>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium ${activeTab === "overview" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`px-4 py-2 font-medium ${activeTab === "password" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"}`}
            >
              Change Password
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">About</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Full Name</div>
                <div className="col-span-2 text-sm text-gray-700">Carefoundation Admin</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Company</div>
                <div className="col-span-2 text-sm text-gray-700">Care Foundation TrustⓇ</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Country</div>
                <div className="col-span-2 text-sm text-gray-700">India</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Address</div>
                <div className="col-span-2 text-sm text-gray-700">At-EEZ building [BEAT], Ibrahim naimullah Road , Care foundation , Mumbai - 400003</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Phone</div>
                <div className="col-span-2 text-sm text-gray-700">
                  <a 
                    href="https://wa.me/919136521052" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    +91 9136521052
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Email</div>
                <div className="col-span-2 text-sm text-gray-700">carefoundationtrustorg@gmail.com</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="max-w-md">
            <h3 className="text-xl font-semibold text-blue-900 mb-6">Profile Details</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input type="password" className="border rounded-lg px-4 py-2 w-full text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input type="password" className="border rounded-lg px-4 py-2 w-full text-sm"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input type="password" className="border rounded-lg px-4 py-2 w-full text-sm"/>
              </div>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}







