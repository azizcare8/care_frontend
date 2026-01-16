"use client";

import { useState, useEffect } from "react";
import { couponService } from "@/services/couponService";
import { BiGift, BiTime, BiCheckCircle, BiSearch } from "react-icons/bi";
import { FaTag, FaPercent } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";
import BackToHome from "@/components/BackToHome";

const ROLE_DATA = [
  {
    title: "Super Admin (Care Foundation)",
    summary: "Configures the entire coupon ecosystem, approvals, visibility, and payouts.",
    points: [
      "Approve or reject partners, beneficiaries, and donors whenever needed.",
      "Create coupon packages (Food ₹100, Monthly Ration ₹1000, Health Checkup ₹500) while configuring validity and partner eligibility.",
      "See all coupons, transactions, and redemptions, and approve partner settlement requests."
    ]
  },
  {
    title: "Partners – Food / Health Vendors",
    summary: "Vendors redeem coupons and await settlements via the partner panel.",
    points: [
      "Review coupons assigned or redeemed at their outlet along with settlement status.",
      "Redeem coupons by scanning QR codes or entering coupon codes and optionally upload bills or invoices.",
      "View history, filter by date/status, and export reports to aid accounting."
    ]
  },
  {
    title: "Donors – Sponsored Users",
    summary: "Normal users who fund coupons and trace their impact.",
    points: [
      "Register/login, add money, and pick category, package, quantity, and partner preference.",
      "Generate coupons, optionally assign them to beneficiaries, or leave assignment to Care Foundation.",
      "Track all sponsored coupons, see their statuses, and download receipts for tax purposes."
    ]
  },
  {
    title: "Beneficiaries (Needy Person)",
    summary: "Recipients access services without the need to log in.",
    points: [
      "Receive coupon via print, QR, or SMS link triggered by donor or admin.",
      "Show the coupon at partner outlets to redeem food or health services.",
      "Benefit immediately without handling payments or digital accounts."
    ]
  }
];

const COUPON_STRUCTURE = [
  { label: "couponCode", detail: "Unique human-readable ID visible to donors, partners, and admins." },
  { label: "qrCode", detail: "Scannable payload used at partner locations for quick validation." },
  { label: "amount / packageId", detail: "Reflects predefined packages such as Food ₹100 or Health Checkup ₹500." },
  { label: "category", detail: "FOOD or HEALTH to enforce partner alignment." },
  { label: "partnerId", detail: "Optional until redemption to allow 'any partner in the city' scenarios." },
  { label: "donorId", detail: "Link to the user who paid for this coupon." },
  { label: "beneficiaryName", detail: "Filled when the coupon is assigned to a needy person." },
  { label: "beneficiaryPhone", detail: "Optional mobile number for sharing coupon links via SMS/WhatsApp." },
  { label: "status", detail: "Tracks states: CREATED, ASSIGNED, REDEEMED_PENDING_SETTLEMENT, SETTLED, EXPIRED, CANCELLED/REJECTED." },
  { label: "expiryDate", detail: "Defines how long the coupon remains valid and is configured per package." },
  { label: "createdAt / redeemedAt / settledAt", detail: "Timestamps for lifecycle auditing and reports." },
  { label: "Payment references", detail: "Includes transactionId, gatewayId, and settlement references for finance reconciliations." }
];

const FLOW_DATA = [
  {
    title: "Phase 0 – Setup by Super Admin",
    highlights: "Prepare partners and packages before any donor starts sponsoring coupons.",
    steps: [
      "Create Food & Health partner accounts and capture payout details (bank / UPI).",
      "Define coupon packages such as Food ₹100 for 30 days and Health ₹500 for 60 days while specifying eligible partner categories.",
      "Optionally enforce partner-level limits (max coupons per day or per city) during onboarding."
    ]
  },
  {
    title: "Flow A – Donor creates and pays for coupon(s)",
    highlights: "Donors pick packages, pay via gateway, and the backend mints coupons.",
    steps: [
      "Donor signs up/logs in and navigates to Sponsor Coupon in the donor panel.",
      "Choose category (Food/Health), package, quantity, and whether to assign beneficiaries now or leave it to the NGO.",
      "Select a specific partner or opt for 'any partner in the city', then pay the calculated total (amount × quantity plus any NGO charges).",
      "On payment success, the backend creates coupons with status CREATED linked to donorId/packageId and shows the codes/QR to the donor."
    ]
  },
  {
    title: "Flow B – Assign coupon to beneficiary",
    highlights: "Assignment can be done by donors or volunteers/admins.",
    steps: [
      "Donor clicks Assign to Beneficiary, enters name and mobile, status becomes ASSIGNED, and SMS/WhatsApp along with a PDF can be shared.",
      "Super Admin/volunteer picks from CREATED coupons, selects a beneficiary from the registry, assigns the coupon, and triggers the same communication."
    ]
  },
  {
    title: "Flow C – Beneficiary uses coupon at partner outlet",
    highlights: "Partners validate coupons before delivering services.",
    steps: [
      "Beneficiary presents the printed coupon, QR code, or SMS link to the partner outlet.",
      "Partner opens Redeem Coupon, scans QR or types the code, and the backend verifies coupon existence, status, category partner eligibility, and expiry.",
      "If valid, partner confirms service delivery, status updates to REDEEMED_PENDING_SETTLEMENT, redeemedAt is recorded, and an optional invoice/bill can be uploaded."
    ]
  },
  {
    title: "Flow D – Admin verifies and pays partner (Settlement)",
    highlights: "Admin reviews redemptions and approves payouts.",
    steps: [
      "Super Admin accesses the Settlement Dashboard which lists REDEEMED_PENDING_SETTLEMENT coupons with filters such as date, partner, city, or donor.",
      "After checking uploaded bills and spotting anomalies, the admin approves the settlement either per coupon or in bulk.",
      "System updates the coupon to SETTLED, creates a payout entry (partnerId, couponId, payableAmount, approvedBy, paidOn, referenceNo), and partners see paid entries in their Settlements tab."
    ]
  },
  {
    title: "Flow E – Edge cases",
    highlights: "Rejections, expiries, and refunds are handled gracefully.",
    steps: [
      "Partner rejects fraudulent or invalid coupons, the status becomes CANCELLED/REJECTED, and notifications reach Super Admin and optionally the donor.",
      "A daily job flags expired coupons past expiryDate, marks them as EXPIRED, and optionally reminds beneficiaries/donors three days before expiration.",
      "When donors request refunds, Super Admin cancels unused coupons, triggers external refund flows, and updates the donor view to reflect cancellation."
    ]
  }
];

const PANEL_HIGHLIGHTS = [
  {
    title: "Donor Panel",
    focus: "Track impact, sponsor coupons, and download receipts.",
    points: [
      "Dashboard aggregates total coupons sponsored, amount paid, and beneficiaries helped.",
      "Sponsor Coupon workflow lets donors choose category, package, partner preference, quantity, and pay.",
      "My Coupons list filters by Active, Used, Expired with actions to assign, download, or share.",
      "Receipts section provides month-wise/financial-year-wise downloads for records."
    ]
  },
  {
    title: "Partner Panel",
    focus: "Redeem coupons and monitor settlement status.",
    points: [
      "Dashboard shows coupons redeemed today, pending settlement total, and amount received.",
      "Redeem Coupon screen supports QR scanning plus manual code entry.",
      "Coupon History with date/status filters helps investigate trends before settlement reconciliation.",
      "Settlements view separates Paid vs Pending and allows CSV export for accounting."
    ]
  },
  {
    title: "Super Admin Panel",
    focus: "Govern users, coupons, and settlements with transparency.",
    points: [
      "Users & Partners dashboard approves or blocks partners, donors, and beneficiaries.",
      "Coupon Packages module lets admins create/edit/delete packages and configure validity/partners.",
      "Coupons Management section searches by code, donor, partner, or status and provides redemption/settlement actions.",
      "Reports offer insights by city, partner, campaign, or donor for audits."
    ]
  }
];

const STATUS_FLOW = [
  {
    label: "CREATED",
    detail: "Coupon is minted after payment and waits for assignment."
  },
  {
    label: "ASSIGNED",
    detail: "Beneficiary details captured, SMS/QR link delivered before redemption."
  },
  {
    label: "REDEEMED_PENDING_SETTLEMENT",
    detail: "Partner confirmed service delivery and redemption time is recorded."
  },
  {
    label: "SETTLED",
    detail: "Admin approved settlement and payout entry is recorded."
  },
  {
    label: "EXPIRED",
    detail: "Past expiryDate without redemption; optional reminders sent before expiry."
  },
  {
    label: "CANCELLED/REJECTED",
    detail: "Invalid, fraudulent, or refund-requested coupons are stopped before settlement."
  }
];

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setIsLoading(true);
        const params = {
          limit: 50,
          status: "active",
          isPublic: true
        };
        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }
        if (selectedType !== "all") {
          params.type = selectedType;
        }
        const response = await couponService.getCoupons(params);
        setCoupons(response.data || []);
      } catch (error) {
        // Don't log network errors (backend not running)
        if (!error?.isNetworkError && !error?.silent) {
          console.error("Failed to load coupons:", error);
        }
        // Only show toast for non-network errors
        if (!error?.isNetworkError && !error?.silent) {
          toast.error("Failed to load coupons");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [selectedCategory, selectedType]);

  const formatCouponValue = (coupon) => {
    if (coupon.value?.percentage) {
      return `${coupon.value.percentage}% OFF`;
    }
    if (coupon.value?.amount) {
      return `₹${coupon.value.amount.toLocaleString("en-IN")}`;
    }
    return "Special Offer";
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return 0;
    const days = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categories = ["all", "food", "medical", "education", "transport", "clothing", "other"];
  const types = ["all", "discount", "cashback", "free_item", "service"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Back to Home */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <BackToHome />
      </div>

      <section className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BiGift className="text-5xl" />
            <h1 className="text-4xl md:text-5xl font-extrabold">Care Foundation Coupon Journey</h1>
          </div>
          <p className="text-lg md:text-xl text-green-50 max-w-3xl mx-auto">
            From donor payments to partner settlements, every coupon stays visible through approvals, redemption, and finance.
          </p>
          <p className="text-sm text-green-50/80 max-w-3xl mx-auto mt-2">
            Super Admin, partner vendors, donors, and beneficiaries each play a defined role so food and health support reaches those who need it.
          </p>
          <div className="mt-4 w-32 h-1 bg-white mx-auto rounded-full" />
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-600">Roles & Permissions</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Defined responsibilities across the ecosystem</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              Clearly outlined roles keep every coupon traceable from creation to settlement.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {ROLE_DATA.map((role) => (
              <div key={role.title} className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
                  <span className="text-xs uppercase tracking-wide text-emerald-600">Role</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{role.summary}</p>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  {role.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-600">Coupon Blueprint</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">What every coupon stores</h2>
            <p className="mt-2 text-gray-600">These fields power assignment, validation, and settlement.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COUPON_STRUCTURE.map((field) => (
              <div key={field.label} className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{field.label}</p>
                <p className="mt-2 text-sm text-gray-600">{field.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-600">End-to-end Flow</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">How coupons journey from donors to partners</h2>
            <p className="mt-2 text-gray-600">Every phase is documented so donors, partners, and admins know what to expect.</p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {FLOW_DATA.map((flow) => (
              <div key={flow.title} className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wider text-emerald-600">{flow.title}</p>
                <p className="mt-2 text-sm text-gray-700">{flow.highlights}</p>
                <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-gray-600">
                  {flow.steps.map((step, index) => (
                    <li key={`${flow.title}-${index}`}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-emerald-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-600">Panel-wise Screens</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Dashboards tailored to each user</h2>
            <p className="mt-2 text-gray-600">Donor, partner, and admin panels share the right data at the right time.</p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PANEL_HIGHLIGHTS.map((panel) => (
              <div key={panel.title} className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900">{panel.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{panel.focus}</p>
                <ul className="mt-4 list-disc list-inside space-y-2 text-sm text-gray-600">
                  {panel.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-wider text-emerald-600">State machine</p>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Simple coupon status flow</h2>
            <p className="mt-2 text-gray-600">Coupons move through predictable states with side paths for expiry or rejection.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {STATUS_FLOW.map((status) => (
              <div key={status.label} className="flex gap-4 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-sm">
                <div className="flex h-10 w-32 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  {status.label}
                </div>
                <p className="text-sm text-gray-600">{status.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-gray-500">
            CREATED → ASSIGNED → REDEEMED_PENDING_SETTLEMENT → SETTLED with EXPIRED / CANCELLED branching as needed.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BiGift className="text-5xl text-green-600" />
            <h2 className="text-4xl font-bold text-gray-900">Available Coupons & Offers</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore exclusive donations-backed coupons from trusted partners and redeem them at their outlets.
          </p>
          <div className="mt-4 w-32 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search coupons by name, code, or partner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {categories.filter((c) => c !== "all").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Types</option>
                {types.filter((t) => t !== "all").map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-16">
            <BiGift className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No Coupons Found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all" || selectedType !== "all"
                ? "Try adjusting your filters"
                : "No active coupons available at the moment"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoupons.map((coupon) => {
              const daysRemaining = getDaysRemaining(coupon.validity?.endDate);
              const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

              return (
                <div
                  key={coupon._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-green-500"
                >
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaTag className="text-xl" />
                        <span className="font-bold text-lg">{coupon.code}</span>
                      </div>
                      {coupon.partner && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                          {coupon.partner.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold">{coupon.title}</h3>
                  </div>

                  <div className="p-6">
                    <div className="text-center mb-4">
                      <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 rounded-lg px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          {coupon.value?.percentage ? (
                            <FaPercent className="text-green-600 text-2xl" />
                          ) : (
                            <BiGift className="text-green-600 text-2xl" />
                          )}
                          <span className="text-3xl font-bold text-green-600">{formatCouponValue(coupon)}</span>
                        </div>
                      </div>
                    </div>

                    {coupon.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{coupon.description}</p>
                    )}

                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {coupon.category && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {coupon.category.replace(/_/g, " ").toUpperCase()}
                        </span>
                      )}
                      {coupon.type && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {coupon.type.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BiTime className="text-green-600" />
                        <span>
                          {daysRemaining > 0 ? (
                            <span className={isExpiringSoon ? "text-orange-600 font-semibold" : ""}>
                              {daysRemaining} days remaining
                            </span>
                          ) : (
                            <span className="text-red-600">Expired</span>
                          )}
                        </span>
                      </div>
                      {coupon.usage && !coupon.usage.isUnlimited && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BiCheckCircle className="text-blue-600" />
                          <span>
                            {coupon.usage.usedCount || 0} / {coupon.usage.maxUses} used
                            {coupon.usage.maxUses > 1 && (
                              <span className="text-green-600 font-semibold ml-1">
                                ({coupon.usage.maxUses - (coupon.usage.usedCount || 0)} remaining)
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {coupon.partner && (
                      <div className="mb-4 rounded-lg bg-gray-50 p-3">
                        <p className="text-xs text-gray-500 mb-1">Available at:</p>
                        <p className="font-semibold text-gray-800">{coupon.partner.name}</p>
                        {coupon.partner.businessType && (
                          <p className="text-xs text-gray-600">{coupon.partner.businessType}</p>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/redeem-coupon?code=${coupon.code}`}
                      className="block w-full rounded-lg bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 text-center font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-blue-600 hover:shadow-xl hover:scale-105"
                    >
                      Redeem Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

