import React from 'react';

const AssignmentSkeleton: React.FC = () => {
  return (
    <div className="bg-card border p-6 rounded-lg shadow-sm animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 border">
           <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-4"></div>
           <div className="flex justify-around items-center">
                <div className="h-10 bg-muted rounded w-12"></div>
                <div className="h-10 bg-muted rounded w-12"></div>
                <div className="h-10 bg-muted rounded w-12"></div>
                <div className="h-10 bg-muted rounded w-12"></div>
           </div>
        </div>
      </div>
      <div className="mt-6 border-t pt-6">
         <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
         <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-10 bg-muted rounded-full w-full"></div>
            <div className="h-10 bg-muted rounded-lg w-full sm:w-32"></div>
         </div>
      </div>
    </div>
  );
};

export default AssignmentSkeleton;