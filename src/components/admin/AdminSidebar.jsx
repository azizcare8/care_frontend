"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  BiGrid,
  BiCoin,
  BiCode,
  BiGroup,
  BiHeart,
  BiUserPlus,
  BiUserCircle,
  BiUser,
  BiLogOut,
  BiChevronDown,
  BiCalendarEvent,
  BiBell,
  BiMenu,
} from "react-icons/bi";
import { useSidebar } from "./AdminLayout";
import useAuthStore from "@/store/authStore";

const sidebarData = {
  main: [
    { title: "Dashboard", icon: <BiGrid />, href: "/admin" },
    { title: "Reports", icon: <BiCode />, href: "/admin/reports" },
  ],
  backendContent: [
    {
      title: "Donation Section",
      icon: <BiCoin />,
      children: [{ title: "Donation Data", href: "/admin/donations" }],
    },
    {
      title: "Coupon Section",
      icon: <BiCode />,
      children: [
        { title: "Coupon Data", href: "/admin/coupons" },
        { title: "Vendor Wallets", href: "/admin/wallets" },
      ],
    },
    {
      title: "CrownFunding Section",
      icon: <BiGroup />,
      children: [
        { title: "Fundraised Data", href: "/admin/fundraised" },
        { title: "Fundraiser Request", href: "/admin/fundraiser-requests" },
        { title: "Fundraiser Live", href: "/admin/fundraiser-live" },
        { title: "Upload FundRaiser", href: "/admin/create-fundraiser" },
      ],
    },
    {
      title: "Volunteer Section",
      icon: <BiHeart />,
      children: [
        { title: "Volunteer Rqst Data", href: "/admin/volunteer-requests" },
        { title: "Our Volunteers", href: "/admin/volunteers" },
        { title: "Volunteer Cards", href: "/admin/volunteer-cards" },
        { title: "Volunteer Certificates", href: "/admin/volunteer-certificates" },
      ],
    },
    {
      title: "Partner Section",
      icon: <BiUserPlus />,
      children: [
        { title: "Partner Request", href: "/admin/partner-requests" },
        { title: "Add Dr. Partner", href: "/admin/create-doctor" },
        { title: "Add Hospital Partner", href: "/admin/create-hospital" },
        { title: "Add Food Partner", href: "/admin/create-restaurant" },
        { title: "Add Pathology Partner", href: "/admin/create-pathology" },
        { title: "Add Medicine Partner", href: "/admin/create-medicine" },
        { title: "Our Partners", href: "/admin/partners" },
      ],
    },
    {
      title: "Users",
      icon: <BiUserCircle />,
      children: [
        { title: "Registered Users", href: "/admin/users" },
      ],
    },
    {
      title: "Form Submissions",
      icon: <BiUserPlus />,
      children: [{ title: "All Form Submissions", href: "/admin/form-submissions" }],
    },
    {
      title: "Website Queries",
      icon: <BiBell />,
      children: [{ title: "Query Mail", href: "/admin/queries" }],
    },
    {
      title: "Events Section",
      icon: <BiCalendarEvent />,
      children: [
        { title: "Upload Events", href: "/admin/create-event" },
        { title: "Our Events", href: "/admin/events" },
      ],
    },
    {
      title: "Products",
      icon: <BiCode />,
      children: [{ title: "Product Management", href: "/admin/products" }],
    },
    {
      title: "Content Management",
      icon: <BiMenu />,
      children: [
        { title: "Blogs", href: "/admin/blogs" },
        { title: "Celebrities", href: "/admin/celebrities" },
      ],
    },
    { title: "Front Side", icon: <BiMenu />, href: "/" },
  ],
  profile: [
    { title: "Your Profile", icon: <BiUser />, href: "/admin/profile" },
    { title: "Log Out", icon: <BiLogOut />, href: "/logout" },
  ],
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState({});
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const { logout } = useAuthStore();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.warn("Logout error (redirecting anyway):", error);
      router.push("/");
    }
  };

  // Auto-open parent menu if current path matches any child route
  useEffect(() => {
    const newOpenMenus = {};
    sidebarData.backendContent.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) => child.href === pathname);
        if (isChildActive) {
          newOpenMenus[item.title] = true;
        }
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [pathname]);

  const toggleMenu = (title, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenuItem = (item) => {
    if (item.children) {
      return (
        <li key={item.title}>
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 text-left rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 group border-l-2 border-transparent hover:border-blue-500"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMenu(item.title, e);
            }}
          >
            <span className="flex items-center gap-3">
              <span className="inline-block text-gray-500 group-hover:text-blue-600 text-lg transition-colors flex-shrink-0">{item.icon}</span>
              <span className={`text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-all duration-300 ${
                isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
              }`}>{item.title}</span>
            </span>
            {isSidebarOpen && (
              <span
                className={`transition-transform duration-300 inline-block text-gray-400 group-hover:text-blue-600 ${
                  openMenus[item.title] ? "rotate-180" : ""
                }`}
              >
                <BiChevronDown />
              </span>
            )}
          </button>
          {openMenus[item.title] && isSidebarOpen && (
            <ul className="pl-9 mt-1 space-y-0.5">
              {item.children.map((child) => {
                const isActive = pathname === child.href;
                return (
                  <li key={child.title}>
                    <Link
                      href={child.href}
                      onClick={(e) => {
                        // Prevent closing parent menu when clicking child link
                        e.stopPropagation();
                        // Keep parent menu open
                        setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
                        // Close sidebar on mobile when navigating
                        if (window.innerWidth < 768 && closeSidebar) {
                          closeSidebar();
                        }
                      }}
                      className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 border-l-2 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-green-50 text-blue-700 font-semibold border-blue-500"
                          : "text-gray-600 hover:text-blue-600 hover:font-medium border-transparent hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50"
                      }`}
                    >
                      {child.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.title}>
        <Link
          href={item.href || "#"}
          onClick={() => {
            // Close sidebar on mobile when navigating
            if (window.innerWidth < 768 && closeSidebar) {
              closeSidebar();
            }
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 group border-l-2 border-transparent hover:border-blue-500"
        >
          <span className="inline-block text-gray-500 group-hover:text-blue-600 text-lg transition-colors flex-shrink-0">{item.icon}</span>
          <span className={`text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-all duration-300 ${
            isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
          }`}>{item.title}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside 
      className={`h-screen bg-gradient-to-b from-white via-gray-50 to-white fixed top-0 flex flex-col shadow-xl transition-all duration-300 ease-in-out z-50 ${
        isSidebarOpen 
          ? 'w-64 right-0 md:right-auto md:left-0 border-l-2 md:border-r-2 border-gray-200' 
          : 'w-0 overflow-hidden -right-full md:right-auto md:left-0'
      }`}
    >
      {/* Logo/Title - Fixed at top */}
      <div className={`px-4 py-5 border-b-2 border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center gap-3 flex-shrink-0 transition-all duration-300 ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <span className="text-green-600 text-2xl">🌱</span>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'w-auto' : 'w-0'}`}>
          <h2 className="text-lg font-bold text-white whitespace-nowrap">Care Foundation</h2>
          <p className="text-xs text-green-100 whitespace-nowrap">Admin Panel</p>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div 
        className={`flex-1 overflow-y-auto overflow-x-hidden py-4 transition-all duration-300 ${
          isSidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#9CA3AF #F3F4F6' }}
      >
        {/* Main Dashboard */}
        <ul className="space-y-0.5 mb-6 px-3">
          {sidebarData.main.map((item) => renderMenuItem(item))}
        </ul>

        {/* Backend Content Section */}
        {isSidebarOpen && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 py-2 rounded-lg mx-2">
              Backend Content
            </h3>
            <ul className="space-y-1 px-3">
              {sidebarData.backendContent.map((item) => renderMenuItem(item))}
            </ul>
          </div>
        )}

        {/* Profile Section */}
        {isSidebarOpen && (
          <div>
            <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3 px-4 bg-gradient-to-r from-green-50 to-blue-50 py-2 rounded-lg mx-2">
              Profile Section
            </h3>
            <ul className="space-y-1 px-3">
              <li>
                <Link
                  href="/admin/profile"
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 768 && closeSidebar) {
                      closeSidebar();
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 group border-l-2 border-transparent hover:border-blue-500"
                >
                  <span className="inline-block text-gray-500 group-hover:text-blue-600 text-lg transition-colors flex-shrink-0">
                    <BiUser />
                  </span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-all duration-300">
                    Your Profile
                  </span>
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 group border-l-2 border-transparent hover:border-red-500 text-left"
                >
                  <span className="inline-block text-gray-500 group-hover:text-red-600 text-lg transition-colors flex-shrink-0">
                    <BiLogOut />
                  </span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-red-700 transition-all duration-300">
                    Log Out
                  </span>
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}


