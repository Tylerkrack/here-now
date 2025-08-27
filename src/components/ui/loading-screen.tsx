import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-dating/10 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-8">
        <div className="animate-pulse">
          <img 
            src="/lovable-uploads/a17104df-4c8c-4a80-bfe2-2ea1566de20d.png" 
            alt="Here Now Logo" 
            className="w-64 h-auto"
          />
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
