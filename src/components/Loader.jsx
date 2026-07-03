import React from 'react';

const Loader = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-3.5 py-3 select-none animate-elastic">
      <div className="relative h-7 w-7 flex items-center justify-center ai-core-pulse">
        {/* Outer glowing rotating gradient ring */}
        <div className="absolute inset-0 rounded-full ai-core-spinner blur-[2.5px]" />
        {/* Core background mask */}
        <div className="absolute inset-[2.5px] rounded-full bg-dark-sidebar flex items-center justify-center">
          {/* Inner pulsing central glowing core */}
          <div className="h-2.5 w-2.5 rounded-full bg-brand-purple-light shadow-[0_0_14px_#9c158d] animate-pulse" />
        </div>
      </div>
      <span className="text-xs font-bold text-gray-400 tracking-wider uppercase animate-pulse">
        Thinking...
      </span>
    </div>
  );
};

export default Loader;
