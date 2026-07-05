const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5">
    <div className="shimmer h-48 w-full" />
    <div className="p-4 space-y-3">
      <div className="shimmer h-4 w-3/4 rounded-full" />
      <div className="shimmer h-3 w-full rounded-full" />
      <div className="shimmer h-3 w-2/3 rounded-full" />
      <div className="flex justify-between items-center pt-1">
        <div className="shimmer h-3 w-12 rounded-full" />
        <div className="shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="shimmer h-10 w-full rounded-2xl" />
    </div>
  </div>
)

export default SkeletonCard
