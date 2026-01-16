"use client";

import React, { useState } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminTable from "@/components/admin/AdminTable";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    dashboardStats,
    campaigns,
    donations,
    users,
    coupons,
    consultations,
    isLoading,
    error,
    loadMoreData
  } = useAdminData();

  // Define table columns for different data types
  const campaignColumns = [
    { key: 'title', header: 'Title' },
    { key: 'description', header: 'Description' },
    { key: 'targetAmount', header: 'Target Amount' },
    { key: 'currentAmount', header: 'Current Amount' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Created At' }
  ];

  const donationColumns = [
    { key: 'amount', header: 'Amount' },
    { key: 'donorName', header: 'Donor Name' },
    { key: 'campaignTitle', header: 'Campaign' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Date' }
  ];

  const userColumns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status' },
    { key: 'createdAt', header: 'Joined' }
  ];

  const couponColumns = [
    { key: 'code', header: 'Code' },
    { key: 'discount', header: 'Discount' },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status' },
    { key: 'expiryDate', header: 'Expiry' }
  ];

  const consultationColumns = [
    { key: 'name', header: 'Name' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'partnerName', header: 'Partner' },
    { key: 'category', header: 'Category' },
    { key: 'status', header: 'Status' },
    { key: 'payment.amount', header: 'Amount' },
    { key: 'createdAt', header: 'Date' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'campaigns':
        return (
          <AdminTable
            title="Campaigns"
            data={campaigns}
            columns={campaignColumns}
            isLoading={isLoading}
            actions={[
              {
                label: 'Edit',
                variant: 'primary',
                onClick: (campaign) => console.log('Edit campaign:', campaign)
              },
              {
                label: 'Delete',
                variant: 'danger',
                onClick: (campaign) => console.log('Delete campaign:', campaign)
              }
            ]}
          />
        );
      case 'donations':
        return (
          <AdminTable
            title="Donations"
            data={donations}
            columns={donationColumns}
            isLoading={isLoading}
          />
        );
      case 'users':
        return (
          <AdminTable
            title="Users"
            data={users}
            columns={userColumns}
            isLoading={isLoading}
            actions={[
              {
                label: 'Edit',
                variant: 'primary',
                onClick: (user) => console.log('Edit user:', user)
              }
            ]}
          />
        );
      case 'coupons':
        return (
          <AdminTable
            title="Coupons"
            data={coupons}
            columns={couponColumns}
            isLoading={isLoading}
            actions={[
              {
                label: 'Edit',
                variant: 'primary',
                onClick: (coupon) => console.log('Edit coupon:', coupon)
              },
              {
                label: 'Delete',
                variant: 'danger',
                onClick: (coupon) => console.log('Delete coupon:', coupon)
              }
            ]}
          />
        );
      case 'consultations':
        return (
          <AdminTable
            title="Consultations"
            data={consultations}
            columns={consultationColumns}
            isLoading={isLoading}
          />
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <>
      <AdminHeader />
      <div className="min-h-screen bg-gray-100">
        {/* Tab Navigation */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'campaigns', label: 'Campaigns' },
                { id: 'donations', label: 'Donations' },
                { id: 'users', label: 'Users' },
                { id: 'coupons', label: 'Coupons' },
                { id: 'consultations', label: 'Consultations' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderTabContent()}
        </div>
      </div>
    </>
  );
}


