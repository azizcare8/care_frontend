"use client";
import { useState, useEffect, useRef } from "react";
import { couponService } from "@/services/couponService";
import toast from "react-hot-toast";
import { FiX, FiCheckCircle, FiMaximize, FiType, FiCamera, FiBox } from "react-icons/fi";
// Forced Refresh: v2 - Clearing module evaluation cache

export default function RedeemCouponModal({ onRedeemSuccess, onCancel }) {
    const [mode, setMode] = useState(null); // 'scan' or 'enter'
    const [code, setCode] = useState("");
    const [couponData, setCouponData] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const scannerRef = useRef(null);
    const scannerId = "qr-reader-element";

    const [Html5ScannerClass, setHtml5ScannerClass] = useState(null);

    // Load scanner library dynamically to fix Next.js Turbopack HMR cache issues
    useEffect(() => {
        const loadScanner = async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode");
                setHtml5ScannerClass(() => Html5Qrcode);
                console.log("QR Scanner library loaded successfully");
            } catch (err) {
                console.error("Failed to load QR scanner library:", err);
            }
        };
        loadScanner();
    }, []);

    // Handle Verify Code
    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!code.trim()) return;

        setIsVerifying(true);
        setCouponData(null);

        try {
            console.log("Verifying code:", code);
            let coupon = null;

            // Attempt 1: Get by Code (Preferred)
            try {
                const response = await couponService.getCouponByCode(code);
                const data = response.data || response;
                coupon = data.data || data;
            } catch (err) {
                console.warn("getCouponByCode failed, checking for data in error:", err);

                // DATA RECOVERY: Most status errors (exhausted/expired) still send the coupon object in response
                const errData = err.response?.data || err.data || err;
                if (errData.data && (errData.data._id || errData.data.code)) {
                    coupon = errData.data;
                } else if (errData._id || errData.code) {
                    coupon = errData;
                }

                if (!coupon) {
                    // Attempt 2: Fallback to validateCoupon
                    try {
                        const response = await couponService.validateCoupon(code);
                        const data = response.data || response;
                        coupon = data.data || data;
                    } catch (valErr) {
                        console.error("validateCoupon also failed:", valErr);
                    }
                }
            }

            // Final Decision Logic
            const hasId = coupon && (coupon._id || coupon.id);
            if (coupon && hasId && coupon.code) {
                console.log("Verification Success:", coupon);
                setCouponData(coupon);

                // Check specifically for states to show appropriate toast
                const usedCount = coupon.usage?.usedCount || 0;
                const maxUses = coupon.usage?.maxUses || 1;
                const isFullyRedeemed = !coupon.usage?.isUnlimited && usedCount >= maxUses;
                const isExpired = coupon.validity && new Date(coupon.validity.endDate) < new Date();

                if (coupon.status === 'redeemed') {
                    toast.error("This coupon has already been redeemed.");
                } else if (isFullyRedeemed) {
                    toast.error(`Usage limit reached (${usedCount}/${maxUses}).`);
                } else if (isExpired) {
                    toast.error("This coupon has expired.");
                } else {
                    toast.success("Coupon verified successfully!");
                }
            } else {
                console.warn("Invalid coupon structure or missing ID:", coupon);
                toast.error("Invalid coupon code or not found.");
            }
        } catch (error) {
            console.error("Verification error:", error);
            const msg = error.response?.data?.message || error.message || "Failed to verify coupon.";
            toast.error(msg);
        } finally {
            setIsVerifying(false);
        }
    };

    // Handle Redeem
    const handleRedeem = async () => {
        if (!couponData) return;

        const couponId = couponData._id || couponData.id;

        if (!couponId) {
            toast.error("Error: Invalid coupon ID. Please verify again.");
            return;
        }

        if (couponData.usage && !couponData.usage.isUnlimited) {
            const usedCount = couponData.usage.usedCount || 0;
            if (usedCount >= couponData.usage.maxUses) {
                toast.error("This coupon has already been fully redeemed.");
                return;
            }
        }

        setIsRedeeming(true);
        try {
            await couponService.redeemCoupon(couponId, {});
            toast.success("Coupon redeemed successfully!");
            if (onRedeemSuccess) onRedeemSuccess();
            onCancel();
        } catch (error) {
            console.error("Redemption failed:", error);
            const msg = error.response?.data?.message || error.message || "Failed to redeem coupon.";
            toast.error(msg);
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleScanSuccess = (decodedText) => {
        console.log("Scan result:", decodedText);
        if (decodedText) {
            setCode(decodedText);
            stopScanner();
            setMode('enter');
            toast.success("QR Code detected!");
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
                setIsCameraActive(false);
            } catch (err) {
                console.error("Failed to stop scanner:", err);
            }
        }
    };

    const startScanner = async () => {
        if (!Html5ScannerClass) {
            console.warn("Scanner library not yet loaded");
            return;
        }

        try {
            const html5QrCode = new Html5ScannerClass(scannerId);
            scannerRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                handleScanSuccess,
                (errorMessage) => {
                    // Scanning...
                }
            );
            setIsCameraActive(true);
        } catch (err) {
            console.error("Scanner Error:", err);
            toast.error("Could not start camera. Please check permissions.");
        }
    };

    useEffect(() => {
        if (mode === 'scan') {
            const timer = setTimeout(() => {
                startScanner();
            }, 100);
            return () => {
                clearTimeout(timer);
                stopScanner();
            };
        } else {
            stopScanner();
        }
    }, [mode]);

    const renderContent = () => {
        if (couponData) {
            const usedCount = couponData.usage?.usedCount || 0;
            const maxUses = couponData.usage?.maxUses || 1;
            const isUnlimited = couponData.usage?.isUnlimited;
            const isFullyRedeemed = !isUnlimited && usedCount >= maxUses;
            const isExpired = couponData.validity && new Date(couponData.validity.endDate) < new Date();
            const isInvalidStatus = ['rejected', 'cancelled'].includes(couponData.status);
            const canRedeem = !isFullyRedeemed && !isExpired && !isInvalidStatus && couponData.status !== 'redeemed';

            return (
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <div className="flex justify-center mb-4">
                            {canRedeem ? (
                                <FiCheckCircle className="text-5xl text-green-600" />
                            ) : (
                                <FiX className="text-5xl text-red-500" />
                            )}
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${canRedeem ? 'text-green-800' : 'text-red-600'}`}>
                            {canRedeem ? 'Valid Coupon' : 'Cannot Redeem'}
                        </h3>
                        <p className="text-2xl font-mono font-bold text-gray-900 mb-1">{couponData.code}</p>
                        <p className="text-gray-600">{couponData.title}</p>

                        <div className="flex flex-col gap-2 items-center mt-2">
                            {couponData.status === 'redeemed' && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Already Redeemed (Status)</span>
                            )}
                            {isFullyRedeemed && (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Fully Used ({usedCount}/{maxUses})
                                </span>
                            )}
                            {isExpired && (
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">Expired</span>
                            )}
                            {isInvalidStatus && (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Status: {couponData.status}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-green-200">
                            <p className="text-lg font-semibold text-green-700">
                                Valued at: {couponData.value?.percentage ? `${couponData.value.percentage}%` : `${couponData.value?.amount}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Category: {couponData.category}
                            </p>
                            {!isUnlimited && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Usage: {usedCount} / {maxUses}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleRedeem}
                            disabled={isRedeeming || !canRedeem}
                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isRedeeming ? "Processing..." : "Confirm Redemption"}
                        </button>
                        <button
                            onClick={() => {
                                setCouponData(null);
                                setCode("");
                                setMode('scan');
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            );
        }

        if (mode === 'scan') {
            return (
                <div className="text-center space-y-6">
                    <div className="bg-gray-900 rounded-lg overflow-hidden relative mx-auto shadow-inner"
                        style={{ maxWidth: '300px', height: '300px' }}>
                        <div id={scannerId} className="w-full h-full"></div>
                        {!isCameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-gray-800/80">
                                <FiCamera className="text-4xl mb-2 animate-pulse" />
                                <p className="text-xs">Initializing camera...</p>
                            </div>
                        )}
                        <div className="absolute inset-0 border-2 border-green-500 opacity-30 pointer-events-none rounded-lg m-12"></div>
                    </div>
                    <p className="text-sm text-gray-600">Point camera at a valid coupon QR code</p>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setMode(null)}
                            className="w-full px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                    </div>
                </div>
            );
        }

        if (mode === 'enter') {
            return (
                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter Coupon Code
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. SAVE20"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-mono uppercase tracking-wider"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isVerifying || !code}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
                        >
                            {isVerifying ? "Verifying..." : "Verify Code"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode(null)}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                    </div>
                </form>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                    onClick={() => setMode('scan')}
                    className="flex flex-col items-center justify-center p-8 bg-blue-50/50 border-2 border-blue-100 rounded-3xl hover:bg-blue-100/50 hover:border-blue-300 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                        <FiMaximize size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Scan QR Code</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">Use your camera to quickly scan the beneficiary's coupon QR</p>
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    </div>
                </button>

                <button
                    onClick={() => setMode('enter')}
                    className="flex flex-col items-center justify-center p-8 bg-purple-50/50 border-2 border-purple-100 rounded-3xl hover:bg-purple-100/50 hover:border-purple-300 transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform shadow-lg shadow-purple-200">
                        <FiType size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Enter Code</h3>
                    <p className="text-sm text-slate-500 mt-2 text-center leading-relaxed">Manually type the coupon alphanumeric code to verify</p>
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                    </div>
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 relative border border-slate-100">
                {/* Minimal Header / Close Button */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onCancel}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-full transition-all shadow-sm hover:rotate-90 group"
                    >
                        <FiX size={20} className="group-hover:scale-110" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Header Text */}
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
                            <FiMaximize size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Redeem Coupon</h2>
                        <p className="text-slate-500 text-sm mt-1">Select a method to verify and redeem your coupon</p>
                    </div>

                    {/* Content Area */}
                    <div className="transition-all duration-300">
                        {renderContent()}
                    </div>
                </div>

                {/* Footer / Brand (Subtle) */}
                <div className="bg-slate-50/80 px-8 py-3 flex justify-center border-t border-slate-100">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">CareFoundation Verification System</p>
                </div>
            </div>
        </div>
    );
}
