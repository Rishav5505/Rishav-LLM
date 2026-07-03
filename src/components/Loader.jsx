import React from 'react';

const Loader = ({ size = 'md' }) => {
  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3.5 w-3.5',
  };

  const gapSizes = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  };

  return (
    <div className={`flex items-center justify-start ${gapSizes[size]} py-2 px-1`}>
      <span className="sr-only">Rishav AI is thinking...</span>
      <div className={`${dotSizes[size]} animate-bounce rounded-full bg-brand-purple [animation-delay:-0.3s]`}></div>
      <div className={`${dotSizes[size]} animate-bounce rounded-full bg-brand-purple [animation-delay:-0.15s]`}></div>
      <div className={`${dotSizes[size]} animate-bounce rounded-full bg-brand-purple`}></div>
    </div>
  );
};

export default Loader;
