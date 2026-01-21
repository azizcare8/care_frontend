"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCamera } from "react-icons/fa";
import useAuthStore from "@/store/authStore";
import { uploadService } from "@/services/uploadService";

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState("overview");
  const { user, isAuthenticated, isLoading, getCurrentUser, updateUser, updatePassword } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      getCurrentUser().catch(() => {});
    }
  }, [isAuthenticated, user, isLoading, getCurrentUser]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: {
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          pincode: user.address?.pincode || "",
          country: user.address?.country || "India"
        }
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setProfileData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
      return;
    }

    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address
      });
      if (response?.user || response?.data?.user) {
        toast.success("Profile updated successfully");
      } else {
        toast.success("Profile updated");
      }
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await uploadService.uploadFile(formData);
      const avatarUrl = uploadResponse.data.url;

      await updateUser({ avatar: avatarUrl });
      toast.success("Profile image updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile image");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success("Password updated successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user?.name || "Admin"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-blue-600">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "CA"}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 cursor-pointer hover:bg-gray-100 transition-colors shadow-md">
              <FaCamera />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.name || "Carefoundation Admin"}</h2>
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
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-blue-900">About</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setProfileData({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          address: {
                            street: user.address?.street || "",
                            city: user.address?.city || "",
                            state: user.address?.state || "",
                            pincode: user.address?.pincode || "",
                            country: user.address?.country || "India"
                          }
                        });
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Full Name</div>
                <div className="col-span-2 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="border rounded-lg px-3 py-2 w-full text-sm"
                    />
                  ) : (
                    user?.name || "Carefoundation Admin"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Company</div>
                <div className="col-span-2 text-sm text-gray-700">Care Foundation TrustⓇ</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Country</div>
                <div className="col-span-2 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      name="address.country"
                      value={profileData.address.country}
                      onChange={handleProfileChange}
                      className="border rounded-lg px-3 py-2 w-full text-sm"
                    />
                  ) : (
                    user?.address?.country || "India"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Address</div>
                <div className="col-span-2 text-sm text-gray-700">
                  {isEditing ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="address.street"
                        value={profileData.address.street}
                        onChange={handleProfileChange}
                        placeholder="Street"
                        className="border rounded-lg px-3 py-2 w-full text-sm"
                      />
                      <input
                        type="text"
                        name="address.city"
                        value={profileData.address.city}
                        onChange={handleProfileChange}
                        placeholder="City"
                        className="border rounded-lg px-3 py-2 w-full text-sm"
                      />
                      <input
                        type="text"
                        name="address.state"
                        value={profileData.address.state}
                        onChange={handleProfileChange}
                        placeholder="State"
                        className="border rounded-lg px-3 py-2 w-full text-sm"
                      />
                      <input
                        type="text"
                        name="address.pincode"
                        value={profileData.address.pincode}
                        onChange={handleProfileChange}
                        placeholder="Pincode"
                        className="border rounded-lg px-3 py-2 w-full text-sm"
                      />
                    </div>
                  ) : (
                    user?.address?.street || user?.address?.city || user?.address?.state || user?.address?.pincode
                      ? `${user?.address?.street || ""}${user?.address?.street ? ", " : ""}${user?.address?.city || ""}${user?.address?.city ? ", " : ""}${user?.address?.state || ""}${user?.address?.state ? " - " : ""}${user?.address?.pincode || ""}`
                      : "—"
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Phone</div>
                <div className="col-span-2 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="border rounded-lg px-3 py-2 w-full text-sm"
                    />
                  ) : (
                    <a
                      href={user?.phone ? `https://wa.me/91${user.phone}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 transition-colors"
                    >
                      {user?.phone ? `+91 ${user.phone}` : "—"}
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-sm font-medium text-blue-600">Email</div>
                <div className="col-span-2 text-sm text-gray-700">
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="border rounded-lg px-3 py-2 w-full text-sm"
                    />
                  ) : (
                    user?.email || "carefoundationtrustorg@gmail.com"
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="max-w-md">
            <h3 className="text-xl font-semibold text-blue-900 mb-6">Change Password</h3>
            <form className="space-y-4" onSubmit={handleUpdatePassword}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="border rounded-lg px-4 py-2 w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="border rounded-lg px-4 py-2 w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="border rounded-lg px-4 py-2 w-full text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {isUpdatingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}







