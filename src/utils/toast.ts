// A simple toast notification utility
// You can replace this with a more robust library like react-toastify or react-hot-toast

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  duration?: number;
}

const createToast = (message: string, type: ToastType, options: ToastOptions = {}) => {
  const { duration = 3000 } = options;
  
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.top = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.style.minWidth = '250px';
  toast.style.margin = '8px';
  toast.style.padding = '12px 16px';
  toast.style.borderRadius = '4px';
  toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  toast.style.color = 'white';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease-in';
  
  // Set color based on type
  if (type === 'success') {
    toast.style.backgroundColor = '#4caf50';
  } else if (type === 'error') {
    toast.style.backgroundColor = '#f44336';
  } else if (type === 'info') {
    toast.style.backgroundColor = '#2196f3';
  }
  
  toast.textContent = message;
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 10);
  
  // Hide toast after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toastContainer.removeChild(toast);
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }, duration);
};

export const toast = {
  success: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) => createToast(message, 'info', options),
};