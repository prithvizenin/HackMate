export const UserCardSkeleton = () => {
  return (
    <div className="bg-gray-100 brutal-card flex flex-col h-[280px] animate-pulse">
      <div className="p-6 grow flex flex-col">
        <div className="flex items-start space-x-4 mb-5">
          <div className="h-16 w-16 bg-gray-300 brutal-border shrink-0" />
          <div className="space-y-3 grow pt-1">
            <div className="h-5 bg-gray-300 w-3/4 brutal-border" />
            <div className="h-4 bg-gray-300 w-1/2 brutal-border" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="h-8 bg-gray-300 w-24 brutal-border" />
        </div>

        <div className="mt-auto mb-6 flex flex-wrap gap-2">
          <div className="h-6 bg-gray-300 w-16 brutal-border" />
          <div className="h-6 bg-gray-300 w-20 brutal-border" />
          <div className="h-6 bg-gray-300 w-14 brutal-border" />
        </div>

        <div className="pt-4 border-t-2 border-dashed border-gray-300">
          <div className="h-10 bg-gray-300 w-full brutal-border" />
        </div>
      </div>
      
      <div className="border-t-4 border-gray-300 bg-gray-200 h-14 w-full" />
    </div>
  );
};

export const TeamCardSkeleton = () => {
  return (
    <div className="bg-gray-100 brutal-border p-6 h-[240px] animate-pulse">
      <div className="h-6 bg-gray-300 w-1/2 mb-2 brutal-border" />
      <div className="h-4 bg-gray-300 w-1/3 mb-6 brutal-border" />
      <div className="h-4 bg-gray-300 w-1/4 mb-3 brutal-border" />
      <div className="flex gap-3 mb-6">
        <div className="h-12 w-12 bg-gray-300 brutal-border" />
        <div className="h-12 w-12 bg-gray-300 brutal-border" />
        <div className="h-12 w-12 bg-gray-300 brutal-border" />
      </div>
      <div className="flex gap-3 mt-auto">
        <div className="h-10 text-gray-400 bg-gray-300 flex-1 brutal-border" />
        <div className="h-10 text-gray-400 bg-gray-300 flex-1 brutal-border" />
      </div>
    </div>
  );
};

export const RequestSkeleton = () => {
  return (
    <div className="brutal-card p-6 bg-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-pulse">
      <div className="flex items-center gap-6">
        <div className="h-16 w-16 bg-gray-300 brutal-border flex-shrink-0" />
        <div>
          <div className="h-6 bg-gray-300 w-40 mb-2 brutal-border" />
          <div className="h-5 bg-gray-300 w-32 brutal-border" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="h-12 w-32 bg-gray-300 brutal-border" />
        <div className="h-12 w-32 bg-gray-300 brutal-border" />
      </div>
    </div>
  );
};

