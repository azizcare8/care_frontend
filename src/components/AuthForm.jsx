"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import useAuthStore from "../store/authStore";

export default function AuthForm({ redirectUrl }) {
  const router = useRouter();
  const { 
    login, 
    register, 
    forgotPassword, 
    isLoading, 
    error, 
    isAuthenticated, 
    user,
    clearError 
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "donor"
  });
  const [forgotEmail, setForgotEmail] = useState("");

  // Removed auto-redirect useEffect - let pages handle their own redirects
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (user.role === "admin") {
  //       router.push("/admin");
  //     } else {
  //       router.push("/dashboard");
  //     }
  //   }
  // }, [isAuthenticated, user, router]);

  useEffect(() => {
    clearError();
  }, [activeTab, clearError]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleForgotChange = (e) => {
    setForgotEmail(e.target.value);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Validate login fields
    if (!loginData.email || loginData.email.trim() === "") {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!loginData.password || loginData.password.trim() === "") {
      toast.error("Password is required");
      return;
    }

    try {
      const result = await login(loginData);
      toast.success("Login successful!");
      
      // Verify token is stored before redirecting
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        // Wait a bit more and check again
        await new Promise(resolve => setTimeout(resolve, 200));
        const retryToken = Cookies.get('token') || localStorage.getItem('token');
        if (!retryToken) {
          toast.error("Login successful but session not stored. Please try again.");
          return;
        }
      }
      
      // Wait a bit longer to ensure token is stored and state is updated
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Get user data from result
      const loggedInUser = result?.user || result?.data?.user;
      const userRole = loggedInUser?.role;
      
      // Redirect to intended URL or based on user role
      // Priority: redirectUrl > admin role > dashboard
      const destination = redirectUrl || (userRole === "admin" ? "/admin" : "/dashboard");
      
      // Use replace to avoid back button issues
      router.replace(destination);
    } catch (error) {
      // Handle backend errors
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Login failed. Please check your credentials.");
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!registerData.name || registerData.name.trim() === "") {
      toast.error("Full Name is required");
      return;
    }

    if (!registerData.phone || registerData.phone.trim() === "") {
      toast.error("Mobile Number is required");
      return;
    }

    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(registerData.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!registerData.email || registerData.email.trim() === "") {
      toast.error("Email is required");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!registerData.password || registerData.password.trim() === "") {
      toast.error("Password is required");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(registerData.password);
    const hasLowerCase = /[a-z]/.test(registerData.password);
    const hasNumbers = /\d/.test(registerData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    if (!registerData.confirmPassword || registerData.confirmPassword.trim() === "") {
      toast.error("Confirm Password is required");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate role selection
    const validRoles = ['donor', 'fundraiser', 'partner', 'volunteer', 'vendor', 'staff','admin'];
    if (!registerData.role || !validRoles.includes(registerData.role)) {
      toast.error("Please select a valid role");
      return;
    }

    try {
      const { confirmPassword, ...userData } = registerData;
      const result = await register(userData);
      
      // Check if registration requires approval
      if (result?.requiresApproval) {
        // Show success message for pending approval
        const successMessage = result?.message || "Account created successfully! Your role request is pending admin approval. You will be notified once approved.";
        toast.success(successMessage);
      } else {
        // Account was created and user is immediately authenticated
        toast.success(result?.message || "Account created successfully!");
      }
      
      setActiveTab("login");
    } catch (error) {
      // Handle backend validation errors
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    if (!forgotEmail || forgotEmail.trim() === "") {
      toast.error("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      await forgotPassword(forgotEmail);
      toast.success("Password reset link sent to your email!");
      setActiveTab("login");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || "Failed to send reset link");
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-300 via-white to-green-200 p-6 overflow-hidden pt-24">
      
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/main-slider/123.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-5xl shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-lg">

        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/images/main-slider/123.jpg"
            alt="Illustration"
            fill
            sizes="(max-width: 768px) 0vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-green-900/40"></div>
          <div className="absolute inset-0 flex items-center justify-center text-white px-6">
            <h2 className="text-3xl font-bold">
              Join Care Foundation <br /> Start Making a Difference
            </h2>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          
          <div className="flex justify-around mb-6 border-b border-gray-300">
            {["login", "register", "forgot"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 font-medium border-b-2 transition ${
                  activeTab === tab
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-500 hover:text-green-500"
                }`}
              >
                {tab === "login"
                  ? "Login"
                  : tab === "register"
                  ? "Create Account"
                  : "Forgot Password"}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {activeTab === "login" && (
            <form
              onSubmit={handleLoginSubmit}
              className="space-y-4 animate-fadeIn"
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {activeTab === "register" && (
            <form
              onSubmit={handleRegisterSubmit}
              className="space-y-4 animate-fadeIn"
            >
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={registerData.name}
                onChange={handleRegisterChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />

              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={registerData.phone}
                onChange={handleRegisterChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit mobile number"
                maxLength={10}
                required
                disabled={isLoading}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />

              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)"
                value={registerData.password}
                onChange={handleRegisterChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                minLength={6}
                required
                disabled={isLoading}
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />
              
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={registerData.role}
                  onChange={handleRegisterChange}
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                  required
                  disabled={isLoading}
                >
                  <option value="donor">Donor</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="partner">Partner</option>
                  <option value="volunteer">Volunteer</option>
                  <option value="vendor">Vendor</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Your role request will be reviewed by admin. You will be notified once approved.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {activeTab === "forgot" && (
            <form
              onSubmit={handleForgotSubmit}
              className="space-y-4 animate-fadeIn"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={handleForgotChange}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition duration-300 hover:scale-105"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}


