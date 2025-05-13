import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLanguageChange = () => {
    setIsAnimating(true);
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      <button
        onClick={handleLanguageChange}
        className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full hover:from-indigo-700 hover:to-purple-700 shadow-sm transition-all duration-300 hover:shadow"
        aria-label={`Switch to ${language === 'id' ? 'English' : 'Indonesian'}`}
      >
        <Globe className="h-4 w-4" />
        
        <div className="flex items-center gap-1 relative">
          <div className={`flex items-center ${isAnimating ? 'animate-flip-out' : ''}`}>
            <span className={`font-medium ${language === 'id' ? 'opacity-60' : 'opacity-100'}`}>EN</span>
            <div className="mx-1 text-gray-200">/</div>
            <span className={`font-medium ${language === 'en' ? 'opacity-60' : 'opacity-100'}`}>ID</span>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 left-0 flex items-center">
            <div className={`w-1.5 h-1.5 rounded-full bg-white transition-all duration-300 ${language === 'id' ? 'translate-x-[28px]' : 'translate-x-1'}`}></div>
          </div>
        </div>
      </button>

      {/* Language flag indicators */}
      <div className="absolute -top-1 -right-1 h-3 w-3">
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${language === 'id' ? 'bg-red-500' : 'bg-blue-600'}`}></div>
      </div>

      {/* Add animations */}
      <style>
        {`
          @keyframes flip-out {
            0% { transform: perspective(400px) rotateY(0); }
            100% { transform: perspective(400px) rotateY(360deg); }
          }
          .animate-flip-out {
            animation: flip-out 0.5s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}