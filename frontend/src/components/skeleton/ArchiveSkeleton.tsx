import { Skeleton } from './Skeleton';
import './Skeleton.css';

interface ArchiveSkeletonProps {
  count?: number;
}

export function ArchiveSkeleton({ count = 5 }: ArchiveSkeletonProps) {
  return (
    <div className="archive-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="archive-skeleton-item skeleton-list-item">
          <div className="archive-skeleton-cover">
            <Skeleton width={64} height={64} borderRadius={8} />
          </div>
          <div className="archive-skeleton-info">
            <Skeleton variant="text" width="80%" height={16} />
            <Skeleton variant="text" width="60%" height={14} />
            <Skeleton variant="text" width={100} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ArchiveSkeleton;
