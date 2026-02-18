import './Skeleton.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || '1em',
          borderRadius: borderRadius || '4px',
        };
      case 'circular':
        return {
          width: width || '40px',
          height: height || width || '40px',
          borderRadius: '50%',
        };
      default:
        return {
          width: width || '100%',
          height: height || '100px',
          borderRadius: borderRadius || '8px',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof styles.width === 'number' ? `${styles.width}px` : styles.width,
        height: typeof styles.height === 'number' ? `${styles.height}px` : styles.height,
        borderRadius: typeof styles.borderRadius === 'number' ? `${styles.borderRadius}px` : styles.borderRadius,
      }}
    />
  );
}

export default Skeleton;
