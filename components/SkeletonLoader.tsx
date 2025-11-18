
import React from 'react';

const SkeletonLoader: React.FC = () => {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      
      <div className="flex space-x-2 bg-gray-200 p-1 rounded-lg mb-6">
        <div className="w-full h-10 bg-gray-300 rounded-md"></div>
        <div className="w-full h-10 bg-gray-300 rounded-md"></div>
        <div className="w-full h-10 bg-gray-300 rounded-md"></div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-start space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1 w-0.5 bg-gray-200 mt-2"></div>
            </div>
            <div className="flex-1 pt-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="bg-gray-200 p-4 rounded-lg">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6 mt-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;
