import React from 'react';

const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <ul className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <li key={i} className="p-3 rounded-md bg-muted animate-pulse">
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
        </li>
      ))}
    </ul>
  );
};

export default ListSkeleton;