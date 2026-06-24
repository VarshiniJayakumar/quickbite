const SkeletonCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="skeleton h-48 w-full rounded-xl mb-4" />
    <div className="skeleton h-4 w-3/4 mb-2 rounded" />
    <div className="skeleton h-4 w-1/2 mb-3 rounded" />
    <div className="skeleton h-4 w-1/4 mb-4 rounded" />
    <div className="skeleton h-10 w-full rounded-xl" />
  </div>
)

export default SkeletonCard
