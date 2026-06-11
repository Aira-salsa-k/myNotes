import React from "react";
import { Target } from "lucide-react";

export const LoadingState = ({ message = "loading", fullScreen = false }) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center py-20 gap-4 ${fullScreen ? "fixed inset-0 z-[100] bg-[#0b0b0b]/80 backdrop-blur-sm" : ""}`}>
      <div className="relative">
        {/* Outer Ring Animation */}
        <div className="absolute inset-0 rounded-full border-2 border-lime-300/20 animate-[ping_2s_infinite]"></div>
        <div className="absolute inset-0 rounded-full border border-lime-300/40 animate-[spin_3s_linear_infinite]"></div>
        
        {/* Main Icon Container */}
        <div className="relative bg-lime-300/10 p-5 rounded-3xl border border-lime-300/20 backdrop-blur-sm animate-pulse">
          <Target className="text-lime-300" size={40} />
        </div>

        {/* Floating Particles/Dots */}
        <div className="absolute -top-2 -right-2 h-2 w-2 bg-lime-300 rounded-full animate-bounce"></div>
        <div className="absolute -bottom-1 -left-1 h-1.5 w-1.5 bg-lime-300/50 rounded-full animate-bounce delay-150"></div>
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="text-lime-300 pb-2 text-[10px] uppercase tracking-[0.3em] animate-pulse">
          {message}
        </span>
        {/* <div className="flex gap-1">
          <div className="h-1 w-1 bg-lime-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1 w-1 bg-lime-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1 w-1 bg-lime-300 rounded-full animate-bounce"></div>
        </div> */}
      </div>
    </div>
  );
};
