"use client";
import BackToHome from "@/components/BackToHome";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back to Home */}
        <BackToHome />
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Welcome to Care Foundation Trust. By accessing and using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any donations or using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Donations</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>All donations made to Care Foundation Trust are voluntary and non-refundable.</li>
              <li>Donations are eligible for tax exemption under Section 80G of the Income Tax Act, 1961.</li>
              <li>We will provide donation receipts for all contributions received.</li>
              <li>The organization reserves the right to allocate donations as per operational requirements.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Funds</h2>
            <p className="text-gray-600">
              All funds received are used for charitable purposes including but not limited to healthcare, education, food distribution, and community welfare programs. We maintain complete transparency in fund utilization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Privacy Policy</h2>
            <p className="text-gray-600">
              We respect your privacy and are committed to protecting your personal information. Any data collected is used solely for processing donations and communication purposes. We do not share your information with third parties without consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Volunteer Terms</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Volunteers must be 18 years or older to participate in activities.</li>
              <li>Volunteers agree to follow the organization's code of conduct.</li>
              <li>Volunteer work is unpaid and done on a goodwill basis.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <p className="text-gray-600">
              Care Foundation Trust shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services or website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms and Conditions, please contact us at{" "}
              <a href="mailto:carefoundationtrustorg@gmail.com" className="text-green-600 hover:underline">
                carefoundationtrustorg@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}



