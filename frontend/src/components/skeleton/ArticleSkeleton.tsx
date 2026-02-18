import { Skeleton } from './Skeleton';
import './Skeleton.css';

interface ArticleSkeletonProps {
  count?: number;
}

export function ArticleSkeleton({ count = 3 }: ArticleSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="article-skeleton skeleton-list-item">
          <div className="article-skeleton-header">
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width="60%" height={14} />
          </div>
          <div className="article-skeleton-content">
            <Skeleton variant="text" width="100%" height={18} />
            <Skeleton variant="text" width="85%" height={18} />
            <Skeleton variant="text" width="70%" height={14} />
          </div>
          <div className="article-skeleton-footer">
            <Skeleton variant="text" width={60} height={12} />
            <Skeleton variant="text" width={80} height={12} />
          </div>
        </div>
      ))}
    </>
  );
}

export default ArticleSkeleton;
