"use client";
import React, { useState, useEffect } from "react";
import { BiUser, BiArrowToRight, BiChevronDown } from "react-icons/bi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "./AdminLayout";
import useAuthStore from "@/store/authStore";

export default function AdminHeader() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { logout, user, isLoading, getCurrentUser } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    setDropdownOpen(false);
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.warn("Logout error (redirecting anyway):", error);
      router.push("/");
    }
  };

  useEffect(() => {
    // Fetch current user if not already loaded
    if (!user && !isLoading) {
      getCurrentUser().catch((error) => {
        // Silently handle errors - user might not be logged in
        console.warn("Failed to fetch user:", error);
      });
    }
  }, [user, isLoading, getCurrentUser]);

  const handleToggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.name || "Admin";
  const displayEmail = user?.email || "carefoundationtrustorg@gmail.com";
  const initials = getInitials(displayName);

  return (
    <header className={`fixed top-0 right-0 flex items-center justify-between bg-gradient-to-r from-white via-blue-50 to-green-50 shadow-lg z-40 px-3 md:px-6 lg:px-8 py-3 md:py-4 border-b-2 border-gray-200 w-full transition-all duration-300 ease-in-out ${
      isSidebarOpen ? 'md:left-64' : 'left-0'
    }`}>
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center"
          title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <div className="w-5 h-4 md:w-6 md:h-5 flex flex-col justify-between">
            <span className={`block h-0.5 w-full bg-gray-700 rounded transition-all duration-300 ${
              isSidebarOpen ? 'rotate-45 translate-y-2' : ''
            }`}></span>
            <span className={`block h-0.5 w-full bg-gray-700 rounded transition-all duration-300 ${
              isSidebarOpen ? 'opacity-0' : 'opacity-100'
            }`}></span>
            <span className={`block h-0.5 w-full bg-gray-700 rounded transition-all duration-300 ${
              isSidebarOpen ? '-rotate-45 -translate-y-2' : ''
            }`}></span>
          </div>
        </button>
        <h1 className="text-base md:text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          <span className="hidden sm:inline">Admin Dashboard</span>
          <span className="sm:hidden">Admin</span>
        </h1>
      </div>
      <div className="relative">
        <button
          onClick={handleToggleDropdown}
          className="flex items-center gap-2 md:gap-3 focus:outline-none hover:bg-white rounded-xl px-2 md:px-4 py-2 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs md:text-sm">{isLoading ? "..." : initials}</span>
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-gray-900 font-semibold text-sm">
              {isLoading ? "Loading..." : displayName}
            </span>
            <span className="text-gray-500 text-xs">{user?.role || "Admin"}</span>
          </div>
          <BiChevronDown className={`text-gray-400 transition-transform duration-200 hidden md:block ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <ul className="absolute right-0 mt-2 w-64 bg-white border-2 border-gray-200 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm">
            <li className="px-5 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
              <h6 className="font-semibold text-gray-900">
                {isLoading ? "Loading..." : displayName}
              </h6>
              <span className="text-gray-500 text-xs block mt-1">
                {isLoading ? "..." : displayEmail}
              </span>
            </li>

            <li>
              <Link
                href="/admin/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-l-2 border-transparent hover:border-blue-500"
              >
                <BiUser className="text-gray-600 text-lg" />
                <span className="text-gray-700 font-medium text-sm">
                  My Profile
                </span>
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 text-red-600 border-l-2 border-transparent hover:border-red-500 text-left"
              >
                <BiArrowToRight className="text-lg" />
                <span className="font-medium text-sm">
                  Sign Out
                </span>
              </button>
            </li>
          </ul>
        )}
      </div>
    </header>
  );
}


