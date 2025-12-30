export const ProjectsSkeleton = () => {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="p-3 rounded-lg bg-white animate-pulse">
          <div className="flex justify-between items-center mb-3">
            <div className="h-4 bg-gray-200 rounded w-40 mb-1"></div>

            <div className="flex items-center gap-3">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-7 w-7 bg-gray-100 rounded"></div>
              <div className="h-7 w-7 bg-gray-100 rounded"></div>
            </div>
          </div>

          <div className="h-[280px] bg-gray-100 rounded"></div>
        </div>
      ))}
    </div>
  );
};
