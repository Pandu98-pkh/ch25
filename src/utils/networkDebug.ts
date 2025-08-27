// Network debugging utilities
export const getNetworkInfo = () => {
  return {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    origin: window.location.origin,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    onLine: navigator.onLine
  };
};

export const logNetworkInfo = () => {
  const info = getNetworkInfo();
  console.log('Network Debug Info:', info);
  return info;
};

export const testAPIConnectivity = async (baseURL: string) => {
  try {
    const response = await fetch(`${baseURL}/health`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connectivity test successful:', data);
      return { success: true, data };
    } else {
      console.error('API connectivity test failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
  } catch (error) {
    console.error('API connectivity test error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
