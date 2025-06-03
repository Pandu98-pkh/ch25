import React, { useEffect, useState } from 'react';

const TestAPIConnection: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('Testing...');
  const [apiData, setApiData] = useState<any>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Testing API connection...');
        const response = await fetch('http://localhost:5000/api/classes');
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response OK:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API Data received:', data);
          setApiData(data);
          setTestResult(`SUCCESS: Found ${data.data.length} classes`);
        } else {
          const errorText = await response.text();
          console.error('❌ API Error:', response.status, errorText);
          setTestResult(`ERROR: ${response.status} - ${response.statusText}`);
        }
      } catch (error) {
        console.error('🚨 Network Error:', error);
        setTestResult(`NETWORK ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      }
    };

    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 API Connection Test</h2>
      <p><strong>Result:</strong> {testResult}</p>
      {apiData && (
        <div>
          <h3>📊 Data Preview:</h3>
          <pre style={{ background: '#f0f0f0', padding: '10px', maxHeight: '300px', overflow: 'auto' }}>
            {JSON.stringify(apiData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestAPIConnection;
