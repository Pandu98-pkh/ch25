import React, { useState } from 'react';
import axios from 'axios';

const TestLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testLogin = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    const apiUrl = window.location.origin;
    const loginEndpoint = `${apiUrl}/api/users/auth/login`;
    
    console.log('Testing login with:', {
      endpoint: loginEndpoint,
      username,
      hasPassword: !!password
    });

    try {
      const response = await axios({
        method: 'POST',
        url: loginEndpoint,
        data: { username, password },
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: (status) => status < 500, // Accept 4xx and 2xx
      });

      console.log('Login response:', response);
      
      setResult({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        setResult({
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
          isError: true
        });
      } else {
        setError(`Network Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Login API</h1>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
        </div>
        
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          onClick={testLogin}
          disabled={isLoading || !username || !password}
        >
          {isLoading ? 'Testing...' : 'Test Login'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className={`border rounded-lg p-4 ${result.isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <h3 className="font-semibold text-lg mb-2">
            Response ({result.status} {result.statusText})
          </h3>
          <pre className="bg-white p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(result.data, null, 2)}
          </pre>
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-600">Show Headers</summary>
            <pre className="bg-gray-100 p-2 rounded text-xs mt-2">
              {JSON.stringify(result.headers, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Endpoint:</strong> {window.location.origin}/api/users/auth/login</p>
        <p><strong>Method:</strong> POST</p>
        <p><strong>Content-Type:</strong> application/json</p>
      </div>
    </div>
  );
};

export default TestLogin;
