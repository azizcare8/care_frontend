"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BiUpload, BiCheck, BiX } from "react-icons/bi";
import NavBar from "@/components/NavBar";
import useAuthStore from "@/store/authStore";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function KYCVerificationPage() {
  const router = useRouter();
  const { user, isAuthenticated, getCurrentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    aadharNumber: "",
    panNumber: "",
    passportNumber: "",
    drivingLicenseNumber: "",
    aadharFile: null,
    panFile: null,
    passportFile: null,
    drivingLicenseFile: null,
    addressProofFile: null,
    photoFile: null,
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India"
    },
    // Role-based fields - common
    qualification: "",
    specialization: "",
    registrationNumber: "",
    experience: "",
    organization: "",
    // Doctor/Medical specific
    fees: "",
    location: "",
    // Partner/Vendor/Food specific
    businessName: "",
    businessType: "",
    gstNumber: "",
    licenseNumber: "",
    // Pathology specific
    labName: "",
    labRegistration: ""
  });

  const [filePreviews, setFilePreviews] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    checkAuthAndKYCStatus();
  }, []);

  const checkAuthAndKYCStatus = async () => {
    try {
      if (!isAuthenticated) {
        router.push("/login?kyc=true");
        return;
      }

      // Fetch current user to get latest KYC status
      await getCurrentUser();
      
      // Get user from API directly to ensure we have latest data
      try {
        const userResponse = await api.get('/users/profile');
        const currentUser = userResponse.data?.data?.user || userResponse.data?.user || userResponse.data;
        
        setIsLoading(false);

        // If KYC is already verified, redirect
        if (currentUser?.kyc?.isVerified) {
          toast.success("Your KYC is already verified!");
          router.push("/dashboard");
          return;
        } else if (currentUser?.kyc?.isCompleted && !currentUser?.kyc?.isVerified) {
          toast.info("Your KYC is under review. Please wait for admin approval.");
        }
      } catch (profileError) {
        console.error("Error fetching user profile:", profileError);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setIsLoading(false);
      router.push("/login?kyc=true");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${documentType} file size should be less than 5MB`);
        return;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${documentType} must be a PDF or image file (JPG, PNG)`);
        return;
      }

      setFormData({
        ...formData,
        [documentType]: file
      });

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews({
            ...filePreviews,
            [documentType]: reader.result
          });
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews({
          ...filePreviews,
          [documentType]: "pdf"
        });
      }
    }
  };

  const uploadFile = async (file, documentType) => {
    if (!file) return null;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "kyc-documents");

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // Handle different response structures
      return response.data?.url || response.data?.data?.url || null;
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate at least one ID document
    const hasIdDocument = formData.aadharNumber || formData.panNumber || 
                          formData.passportNumber || formData.drivingLicenseNumber;
    
    if (!hasIdDocument) {
      toast.error("Please provide at least one ID document (Aadhar, PAN, Passport, or Driving License)");
      return;
    }

    if (!formData.addressProofFile) {
      toast.error("Please upload proof of address");
      return;
    }

    if (!formData.photoFile) {
      toast.error("Please upload your passport size photograph");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Uploading documents...");

      // Upload all files
      const uploadPromises = [];
      const documentTypes = ['aadharFile', 'panFile', 'passportFile', 'drivingLicenseFile', 'addressProofFile', 'photoFile'];
      
      for (const docType of documentTypes) {
        if (formData[docType]) {
          uploadPromises.push(
            uploadFile(formData[docType], docType).then(url => ({ type: docType, url }))
          );
        }
      }

      const uploadedResults = await Promise.all(uploadPromises);
      const fileUrls = {};
      uploadedResults.forEach(({ type, url }) => {
        fileUrls[type] = url;
      });

      // Prepare KYC submission data
      const documents = [];
      
      if (formData.aadharNumber && fileUrls.aadharFile) {
        documents.push({
          type: 'aadhar',
          number: formData.aadharNumber,
          file: fileUrls.aadharFile,
          verified: false
        });
      }
      
      if (formData.panNumber && fileUrls.panFile) {
        documents.push({
          type: 'pan',
          number: formData.panNumber,
          file: fileUrls.panFile,
          verified: false
        });
      }
      
      if (formData.passportNumber && fileUrls.passportFile) {
        documents.push({
          type: 'passport',
          number: formData.passportNumber,
          file: fileUrls.passportFile,
          verified: false
        });
      }
      
      if (formData.drivingLicenseNumber && fileUrls.drivingLicenseFile) {
        documents.push({
          type: 'driving_license',
          number: formData.drivingLicenseNumber,
          file: fileUrls.drivingLicenseFile,
          verified: false
        });
      }

      // Prepare role-specific data based on user role
      let roleSpecificData = null;
      const userRole = user?.role?.toLowerCase();
      const userEmail = user?.email?.toLowerCase() || '';
      
      // Check for doctor/medical/psychology roles first (by email or role)
      const isDoctorRole = userEmail.includes('doctor') || userEmail.includes('dr') || userEmail.includes('medical') || userEmail.includes('psychology');
      const isPathologyRole = userEmail.includes('pathology') || userEmail.includes('lab');
      
      if (isPathologyRole) {
        // Pathology Lab specific data
        roleSpecificData = {
          labName: formData.labName || null,
          labRegistration: formData.labRegistration || null,
          gstNumber: formData.gstNumber || null,
          location: formData.location || null,
          businessName: formData.businessName || null,
          businessType: formData.businessType || null
        };
      } else if (isDoctorRole || userRole === 'doctor') {
        // Doctor/Medical Professional specific data
        roleSpecificData = {
          qualification: formData.qualification || null,
          specialization: formData.specialization || null,
          registrationNumber: formData.registrationNumber || null,
          experience: formData.experience || null,
          organization: formData.organization || null,
          fees: formData.fees || null,
          location: formData.location || null
        };
      } else if (userRole === 'volunteer') {
        // Volunteer specific data
        roleSpecificData = {
          qualification: formData.qualification || null,
          specialization: formData.specialization || null,
          registrationNumber: formData.registrationNumber || null,
          experience: formData.experience || null,
          organization: formData.organization || null
        };
      } else if (userRole === 'partner' || userRole === 'vendor') {
        // Partner/Vendor/Business specific data
        const isFoodPartner = userEmail.includes('food') || userEmail.includes('restaurant');
        roleSpecificData = {
          businessName: formData.businessName || null,
          businessType: formData.businessType || null,
          gstNumber: formData.gstNumber || null,
          licenseNumber: formData.licenseNumber || null,
          experience: formData.experience || null,
          location: formData.location || null,
          organization: formData.organization || null,
          // Also include professional fields if provided
          qualification: formData.qualification || null,
          specialization: formData.specialization || null,
          registrationNumber: formData.registrationNumber || null
        };
      } else if (userRole === 'donor' || userRole === 'fundraiser') {
        // Basic role-specific data if needed
        roleSpecificData = {
          organization: formData.organization || null
        };
      } else {
        // Default/Other roles - include common fields
        roleSpecificData = {
          qualification: formData.qualification || null,
          specialization: formData.specialization || null,
          registrationNumber: formData.registrationNumber || null,
          experience: formData.experience || null,
          organization: formData.organization || null
        };
      }

      // Submit KYC data
      const kycData = {
        documents: documents,
        address: formData.address,
        addressProof: fileUrls.addressProofFile,
        photo: fileUrls.photoFile,
        roleSpecificData: roleSpecificData
      };

      await api.post("/users/kyc/submit", kycData);
      
      toast.dismiss();
      toast.success("KYC documents submitted successfully! Admin will review and verify your documents.");
      
      // Refresh user data
      await getCurrentUser();
      
      // Redirect after delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to submit KYC documents. Please try again.");
      console.error("KYC submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Determine role-based field visibility
  const userRole = user?.role?.toLowerCase();
  const showRoleBasedFields = userRole === 'volunteer' || userRole === 'partner' || 
                               userRole === 'vendor' || userRole === 'donor' || 
                               userRole === 'fundraiser' || userRole === 'staff' ||
                               user?.email?.includes('psychology') || user?.email?.includes('doctor') ||
                               user?.email?.includes('pathology');
  
  const isDoctorRole = userRole === 'partner' && (user?.email?.includes('doctor') || user?.email?.includes('dr') || user?.email?.includes('medical'));
  const isPathologyRole = user?.email?.includes('pathology') || user?.email?.includes('lab');
  const isVolunteerRole = userRole === 'volunteer';
  const isPartnerRole = userRole === 'partner' || userRole === 'vendor';
  const isFoodPartner = userRole === 'partner' && (user?.email?.includes('food') || user?.email?.includes('restaurant'));

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
              KYC Verification
            </h1>
            <p className="text-gray-600 mb-8">
              Complete your Know Your Customer (KYC) verification by providing the required documents and information.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* ID Documents Section */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Identity Documents</h2>
                <p className="text-sm text-gray-600 mb-6">Please provide at least one government-issued photo ID.</p>
                
                <div className="space-y-6">
                  {/* Aadhar Card */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Aadhar Card Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                      placeholder="Enter 12-digit Aadhar number"
                      maxLength="12"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Aadhar Card
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, "aadharFile")}
                            className="hidden"
                          />
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                            {filePreviews.aadharFile ? (
                              <div className="flex items-center justify-center gap-2 text-green-600">
                                <BiCheck size={20} />
                                <span className="text-sm font-medium">File Selected</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-gray-600">
                                <BiUpload size={20} />
                                <span className="text-sm">Click to upload</span>
                              </div>
                            )}
                          </div>
                        </label>
                        {filePreviews.aadharFile && filePreviews.aadharFile !== "pdf" && (
                          <img src={filePreviews.aadharFile} alt="Aadhar preview" className="w-20 h-20 object-cover rounded" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      PAN Card Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      placeholder="Enter PAN number"
                      maxLength="10"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload PAN Card
                      </label>
                      <label className="flex-1 cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, "panFile")}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                          {filePreviews.panFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <BiCheck size={20} />
                              <span className="text-sm font-medium">File Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <BiUpload size={20} />
                              <span className="text-sm">Click to upload</span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Passport */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passport Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      placeholder="Enter passport number"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Passport
                      </label>
                      <label className="flex-1 cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, "passportFile")}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                          {filePreviews.passportFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <BiCheck size={20} />
                              <span className="text-sm font-medium">File Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <BiUpload size={20} />
                              <span className="text-sm">Click to upload</span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Driving License */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Driving License Number (Optional)
                    </label>
                    <input
                      type="text"
                      name="drivingLicenseNumber"
                      value={formData.drivingLicenseNumber}
                      onChange={handleInputChange}
                      placeholder="Enter driving license number"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Driving License
                      </label>
                      <label className="flex-1 cursor-pointer block">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, "drivingLicenseFile")}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                          {filePreviews.drivingLicenseFile ? (
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <BiCheck size={20} />
                              <span className="text-sm font-medium">File Selected</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2 text-gray-600">
                              <BiUpload size={20} />
                              <span className="text-sm">Click to upload</span>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Address Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleInputChange}
                      required
                      maxLength="6"
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Proof of Address * (Utility bill, Bank statement, or Rental agreement)
                  </label>
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "addressProofFile")}
                      className="hidden"
                      required
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                      {filePreviews.addressProofFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <BiCheck size={20} />
                          <span className="text-sm font-medium">Address Proof Selected</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <BiUpload size={20} />
                          <span className="text-sm">Click to upload address proof</span>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Photo Section */}
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Photograph</h2>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passport Size Photograph * (Recent, clear photo)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "photoFile")}
                        className="hidden"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                        {filePreviews.photoFile ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <BiCheck size={20} />
                            <span className="text-sm font-medium">Photo Selected</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-gray-600">
                            <BiUpload size={20} />
                            <span className="text-sm">Click to upload photo</span>
                          </div>
                        )}
                      </div>
                    </label>
                    {filePreviews.photoFile && filePreviews.photoFile !== "pdf" && (
                      <img src={filePreviews.photoFile} alt="Photo preview" className="w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                </div>
              </div>

              {/* Role-based Fields - Doctor/Medical/Psychology */}
              {(isDoctorRole || user?.email?.includes('psychology') || user?.email?.includes('doctor')) && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-r from-blue-50 to-green-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>👨‍⚕️</span>
                    Doctor/Medical Professional Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification *</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="e.g., MBBS, MD, B.Sc Psychology"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g., Clinical Psychology, Cardiology, General Medicine"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number *</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        placeholder="Medical Council Registration Number"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 years"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Consultation Fees (if applicable)</label>
                      <input
                        type="text"
                        name="fees"
                        value={formData.fees}
                        onChange={handleInputChange}
                        placeholder="e.g., 500 per consultation"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Clinic/Hospital Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Clinic or hospital address"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Organization/Institution</label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Hospital, clinic, or institution name"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-based Fields - Pathology/Lab */}
              {isPathologyRole && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🔬</span>
                    Pathology Lab Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Name *</label>
                      <input
                        type="text"
                        name="labName"
                        value={formData.labName}
                        onChange={handleInputChange}
                        placeholder="Enter lab name"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Registration Number *</label>
                      <input
                        type="text"
                        name="labRegistration"
                        value={formData.labRegistration}
                        onChange={handleInputChange}
                        placeholder="Lab registration/license number"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="GST number (if applicable)"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lab Address/Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Lab complete address"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-based Fields - Volunteer */}
              {isVolunteerRole && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>❤️</span>
                    Volunteer Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Qualification</label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        placeholder="e.g., B.Sc, B.Com, Diploma"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization/Area of Interest</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        placeholder="e.g., Education, Health, Environment"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Professional Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 2 years in social work"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Registration/Certificate Number (if any)</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleInputChange}
                        placeholder="Professional certificate or registration"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Organization/Institution</label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        placeholder="Your current workplace or organization"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Role-based Fields - Partner/Vendor/Food */}
              {(isPartnerRole || isFoodPartner) && (
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🏢</span>
                    Business/Partner Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business/Partner Name *</label>
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        placeholder="Enter business or partner name"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type *</label>
                      <select
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select Business Type</option>
                        {isFoodPartner && (
                          <>
                            <option value="restaurant">Restaurant</option>
                            <option value="food_server">Food Server</option>
                            <option value="food_grain_supplier">Food Grain Supplier</option>
                            <option value="milk_bread_vendor">Milk/Bread Vendor</option>
                            <option value="cafe">Cafe</option>
                            <option value="hawker">Hawker</option>
                          </>
                        )}
                        <option value="vendor">Vendor</option>
                        <option value="retailer">Retailer</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="service_provider">Service Provider</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="15-digit GST number (if applicable)"
                        maxLength="15"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">License Number *</label>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="Business license or registration number"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Experience</label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g., 5 years in business"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Business Address/Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Complete business address"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit KYC Documents"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

