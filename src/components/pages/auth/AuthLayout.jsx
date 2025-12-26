// src/components/pages/auth/AuthLayout.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function AuthLayout({ children, type = "login" }) {
  const location = useLocation();
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
  });

  useEffect(() => {
    const fromAuthPage = location.state?.fromAuthPage || false;
    setShouldAnimate(fromAuthPage);
  }, [location]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 768;

  // Custom scrollbar styles
  const scrollbarStyles = `
    .auth-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .auth-scrollbar::-webkit-scrollbar-track {
      background: #f8fafc;
    }
    .auth-scrollbar::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }
  `;

  const getContainerClasses = () => {
    if (isMobile) {
      // make form fill available vertical space on mobile, allow scrolling
      return "w-full flex-1 min-h-[60vh] rounded-none m-0 shadow-none overflow-y-auto auth-scrollbar p-4 bg-white";
    }

    const baseClasses = "m-4 rounded-2xl w-full md:w-[28rem] max-w-[28rem] min-h-[32rem] h-auto md:h-[40rem] p-6 md:p-8 shadow-[0_10px_40px_rgba(11,26,46,0.1)] border border-gray-200 bg-white";
    const animationClasses = shouldAnimate
      ? (type === "login" ? "animate-slide-in-left" : "animate-slide-in-right")
      : "";

    return `${baseClasses} ${animationClasses} auth-scrollbar`;
  };

  const getBackgroundClasses = () => {
    // fixed invalid Tailwind color usage (bg-[ffffff] was wrong)
    if (isMobile) {
      return "min-h-screen bg-white w-full flex items-center justify-center";
    }
    return "min-h-screen bg-white flex items-center justify-center p-4";
  };

  // Layout order: On mobile we want branding above form but DOM keeps form first,
  // so use flex-col-reverse to display branding on top visually.
  const getLayoutOrder = () => {
    if (isMobile) return "flex-col-reverse";
    return type === "login" ? "flex-row" : "flex-row-reverse";
  };

  return (
    <div className={`${getBackgroundClasses()} font-['Inter','Segoe_UI','Roboto',sans-serif]`}>
      <style>{scrollbarStyles}</style>

      <div className={`w-full ${isMobile ? 'h-full' : 'max-w-6xl rounded-3xl shadow-[0_20px_60px_rgba(11,26,46,0.2)] overflow-hidden bg-white'} flex ${getLayoutOrder()}`}>
        {/* Form Container (DOM-first) */}
        <div className={`bg-white flex flex-col justify-between ${getContainerClasses()}`}>
          {children}
        </div>

        {/* Branding Section - desktop only */}
        {!isMobile && (
          <div className="flex-1 min-h-[40rem] flex justify-center items-center bg-gradient-to-br from-[#0b1a2e] to-[#1e3a5c] text-white p-12">
            <div className="text-center leading-tight max-w-md">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <span className="text-3xl">⚖️</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Court Assist
              </h1>
              <p className="text-xl opacity-90 mb-6 font-light">
                {type === "login" ? "Welcome Back" : "Join to Get Started"}
              </p>
            </div>
          </div>
        )}

        {/* Mobile Branding (rendered after form in DOM but flex-col-reverse shows it visually on top) */}
        {isMobile && (
          <div className="w-full bg-white py-6 px-4 text-center border-t border-gray-100">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0b1a2e] to-[#1e3a5c] rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white">⚖️</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0b1a2e] to-[#1e3a5c] bg-clip-text text-transparent">
                Court Assist
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              {type === "login" ? "Welcome Back" : "Join to Get Started"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthLayout;
