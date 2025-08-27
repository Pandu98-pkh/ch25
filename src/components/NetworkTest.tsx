import React, { useState } from 'react';
import axios from 'axios';

const NetworkTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);

    // Test 1: Basic network info
    const networkInfo = {
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      origin: window.location.origin,
      userAgent: navigator.userAgent,
      onLine: navigator.onLine
    };
    addResult('Network Info', networkInfo);

    // Test 2: Health check
    try {
      const healthResponse = await axios.get('/health', { timeout: 10000 });
      addResult('Health Check (/health)', { status: healthResponse.status, data: healthResponse.data });
    } catch (error: any) {
      addResult('Health Check (/health)', { error: error.message, code: error.code });
    }

    // Test 3: API Health check
    try {
      const apiHealthResponse = await axios.get('/api/health', { timeout: 10000 });
      addResult('API Health Check (/api/health)', { status: apiHealthResponse.status, data: apiHealthResponse.data });
    } catch (error: any) {
      addResult('API Health Check (/api/health)', { error: error.message, code: error.code });
    }

    // Test 4: Direct IP health check
    const currentOrigin = window.location.origin;
    try {
      const directHealthResponse = await axios.get(`${currentOrigin}/health`, { timeout: 10000 });
      addResult(`Direct Health Check (${currentOrigin}/health)`, { status: directHealthResponse.status, data: directHealthResponse.data });
    } catch (error: any) {
      addResult(`Direct Health Check (${currentOrigin}/health)`, { error: error.message, code: error.code });
    }

    // Test 5: Login endpoint test (without credentials)
    try {
      const loginResponse = await axios.post('/api/users/auth/login', {}, { timeout: 10000 });
      addResult('Login Endpoint Test', { status: loginResponse.status, data: loginResponse.data });
    } catch (error: any) {
      addResult('Login Endpoint Test', { 
        error: error.message, 
        code: error.code, 
        status: error.response?.status,
        responseData: error.response?.data 
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Network Connectivity Test</h1>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Running Tests...' : 'Run Network Tests'}
      </button>

      <div className="mt-6 space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-lg">{result.test}</h3>
            <p className="text-sm text-gray-600 mb-2">{result.timestamp}</p>
            <pre className="bg-white p-2 rounded text-sm overflow-x-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkTest;
