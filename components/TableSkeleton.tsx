import React from 'react';

const TableSkeleton: React.FC<{ rows?: number; cols: number }> = ({ rows = 5, cols }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} scope="col" className="h-12 px-4">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="p-4 whitespace-nowrap">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;