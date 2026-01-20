"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import AuthForm from "@/components/AuthForm";
import useAuthStore from "@/store/authStore";

export default function NavBar() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authSnapshot, setAuthSnapshot] = useState({
    isAuthenticated: false,
    user: null
  });

  useEffect(() => {
    setAuthSnapshot({ isAuthenticated, user });
    setAuthReady(true);
  }, [isAuthenticated, user]);

  const effectiveAuth = authReady ? authSnapshot.isAuthenticated : false;
  const effectiveUser = authReady ? authSnapshot.user : null;

  const navLinks = [
    { label: "Home", href: "/" },
    {
      label: "Crowd Funding",
      href: null,
      submenu: [
        { label: "Start a Fundraiser", href: "/startfundraiser" },
        { label: "Fundraised", href: "/fundraised" },
        { label: "Fundraiser", href: "/fundraisers" },
      ]
    },
    {
      label: "Partners",
      href: null,
      submenu: [
        { label: "Food Partners", href: "/partners/food" },
        { label: "Health Partners", href: "/partners/health" },
        { label: "Medical Doctors", href: "/partners/health?type=clinic" },
        { label: "Hospitals", href: "/partners/health?type=hospital" },
        { label: "Pathology Labs", href: "/partners/health?type=pathology" },
        { label: "Pharmacies", href: "/partners/health?type=pharmacy" }
      ]
    },
    {
      label: "Join Us",
      href: null,
      submenu: [
        { label: "Become A Partner", href: "/partner" },
        { label: "Become A Volunteer", href: "/volunteer" },
        { label: "Volunteer Directory", href: "/volunteers" },
      ]
    },
    {
      label: "More",
      href: null,
      submenu: [
        { label: "Events", href: "/events" },
        { label: "Transparency", href: "/transparency" },
        { label: "Founder", href: "/founder" },
      ]
    },
  ];

  const handleClick = (path) => {
    if (path) {
      router.push(path);
      setMenuOpen(false);
      setOpenDropdown(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      setMenuOpen(false);
    } catch (error) {
      console.warn("Logout error:", error);
      router.push("/");
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] bg-white transition-all duration-300 shadow-md">
        {/* Gradient bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-blue-500 to-pink-500"></div>

        <div className="w-full max-w-full mx-auto">
          {/* Main Navbar Container */}
          <div className="flex items-center justify-between px-4 md:px-6 lg:px-8 py-3 border-b border-gray-100">

            {/* Logo and Branding */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/trademark.png"
                alt=""
                width={190}
                height={190}
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                priority
                unoptimized
              />
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-bold text-green-700 leading-tight">

                </h1>
                <p className="text-xs md:text-sm text-green-600 font-medium"></p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link, index) => {
                // Pre-compute dropdown className to ensure server/client consistency
                const isOpen = openDropdown === index;
                const dropdownBaseClass = "absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 z-50";
                const dropdownVisibilityClass = isOpen ? "opacity-100 visible" : "opacity-0 invisible";
                const dropdownClass = `${dropdownBaseClass} ${dropdownVisibilityClass}`;

                return (
                  <div key={index} className="relative group">
                    {link.submenu ? (
                      <>
                        <button
                          className="flex items-center gap-1 text-gray-800 font-semibold text-base hover:text-green-600 transition-colors duration-300 py-2"
                          onMouseEnter={() => setOpenDropdown(index)}
                        >
                          {link.label}
                          <FaChevronDown className="text-xs group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div
                          className={dropdownClass}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          {link.submenu.map((subItem, subIndex) => (
                            <button
                              key={subIndex}
                              onClick={() => handleClick(subItem.href)}
                              className="block text-gray-800 hover:text-green-600 px-5 py-3 hover:bg-green-50 w-full text-left transition-all duration-200 border-b border-gray-100 last:border-b-0"
                            >
                              {subItem.label}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => handleClick(link.href)}
                        className="text-gray-800 font-semibold text-base hover:text-green-600 transition-colors duration-300 py-2 relative group"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Desktop Sign In / Logout Button */}
              <div className="ml-4 flex items-center gap-3">
                {/* KYC Verification Icon - Show when KYC is verified */}
                {effectiveAuth && effectiveUser?.kyc?.isVerified && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md"
                    title="KYC Verification Complete"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold hidden sm:inline">KYC Verified</span>
                  </div>
                )}
                {effectiveAuth ? (
                  <>
                    <button
                      onClick={() => handleClick("/admin")}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-gray-700 text-2xl focus:outline-none p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {menuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 shadow-xl">
              <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {navLinks.map((link, index) => (
                  <div key={index}>
                    {link.submenu ? (
                      <div>
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="flex items-center justify-between w-full text-left text-gray-800 font-semibold text-base hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200"
                        >
                          <span>{link.label}</span>
                          <FaChevronDown className={`text-xs transition-transform duration-300 ${openDropdown === index ? 'rotate-180' : ''}`} />
                        </button>
                        {openDropdown === index && (
                          <div className="pl-4 pr-2 py-2 space-y-1">
                            {link.submenu.map((subItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => handleClick(subItem.href)}
                                className="block w-full text-left text-gray-700 hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                              >
                                {subItem.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClick(link.href)}
                        className="block w-full text-left text-gray-800 font-semibold text-base hover:text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-all duration-200"
                      >
                        {link.label}
                      </button>
                    )}
                  </div>
                ))}

                {/* Mobile Sign In / Logout */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {/* KYC Verification Icon - Mobile */}
                  {effectiveAuth && effectiveUser?.kyc?.isVerified && (
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-semibold">KYC Verified</span>
                    </div>
                  )}
                  {effectiveAuth ? (
                    <>
                      <button
                        onClick={() => handleClick("/admin")}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md transition-all text-center"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 shadow-md transition-all text-center"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLogin(true);
                        setMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 shadow-md transition-all text-center"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Auth Form Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[999] bg-white overflow-auto">
          <button
            onClick={() => setShowLogin(false)}
            className="absolute top-4 right-4 text-gray-700 text-2xl hover:text-red-500 z-50 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all"
            aria-label="Close"
          >
            ✕
          </button>
          <AuthForm />
        </div>
      )}
    </>
  );
}

