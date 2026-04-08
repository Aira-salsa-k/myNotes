import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * A simple toast-like notification component.
 * @param {Object} props
 * @param {string} props.message - The message to display.
 * @param {'success' | 'error' | 'info'} props.type - The type of notification.
 * @param {number} props.duration - Duration in ms before auto-closing.
 * @param {Function} props.onClose - Callback when the notification closes.
 */
export const Notification = ({
  message,
  type = "success",
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-lime-400" size={20} />,
    error: <XCircle className="text-red-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const bgColors = {
    success: "bg-lime-950/40 border-lime-500/20",
    error: "bg-red-950/40 border-red-500/20",
    info: "bg-blue-950/40 border-blue-500/20",
  };

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out",
        bgColors[type],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-white text-sm font-medium pr-2">{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-auto text-gray-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
