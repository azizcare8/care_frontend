"use client";
import { useState } from 'react';
import { testBackendConnection, testRegistration } from '@/utils/testConnection';

export default function ConnectionTest() {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await testBackendConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testReg = async () => {
    setIsLoading(true);
    setTestResult(null);

    const testData = {
      name: "Test User",
      email: "test@example.com",
      phone: "9876543210",
      password: "test123",
      role: "donor"
    };

    try {
      const result = await testRegistration(testData);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Backend Connection Test</h3>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Connection"}
        </button>

        <button
          onClick={testReg}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Test Registration"}
        </button>
      </div>

      {testResult && (
        <div className={`p-4 rounded ${testResult.success
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
          <h4 className="font-semibold">
            {testResult.success ? '✅ Success' : '❌ Error'}
          </h4>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'https://carefoundationtrust.org/api'}</p>
        <p><strong>Status:</strong> Use the test buttons above to verify connectivity.</p>
      </div>
    </div>
  );
}









