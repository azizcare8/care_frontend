"use client";
import React, { useState, createContext, useContext, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";

// Create context for sidebar state
const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile

  useEffect(() => {
    // On desktop (md and above), open sidebar by default
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    // Only close on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 relative">
        {/* Overlay for mobile - with blur effect */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}
        
        <AdminSidebar />
        
        <div 
          className={`flex-1 overflow-x-auto min-w-0 transition-all duration-300 ease-in-out w-full ${
            isSidebarOpen ? 'md:ml-64' : ''
          }`}
        >
          <AdminHeader />
          <main className="pt-20 md:pt-24 px-3 md:px-6 lg:px-8 pb-6 min-h-screen min-w-full transition-all duration-300">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default AdminLayout;
