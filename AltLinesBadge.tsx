/**
 * Alt Lines Badge React Component
 * 
 * Displays a small badge below spread/total values when alternative lines are available.
 * Badge only appears when alt lines exist.
 */

import React from 'react';

interface AltLinesBadgeProps {
  /** Array of alternative lines. Badge only shows if array has items. */
  altLines?: Array<any>;
  /** Click handler for the badge */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Additional CSS class for the badge */
  className?: string;
}

/**
 * Alt Lines Badge Component
 * 
 * Renders a small badge below the spread/total value when alternative lines exist.
 * Returns null if no alt lines are provided or array is empty.
 */
export const AltLinesBadge: React.FC<AltLinesBadgeProps> = ({
  altLines = [],
  onClick,
  className = ''
}) => {
  // Only show badge if alt lines exist
  const hasAltLines = altLines && altLines.length > 0;
  
  if (!hasAltLines) {
    return null;
  }

  const badgeClasses = `alt-lines-badge ${className}`.trim();

  return (
    <div 
      className={badgeClasses}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as any);
        }
      }}
    >
      ALT LINES
    </div>
  );
};

/**
 * Spread/Total Container Component
 * 
 * Wraps a spread or total value with the alt lines badge below it.
 */
interface SpreadTotalContainerProps {
  /** The spread or total value to display */
  value: string | number;
  /** Array of alternative lines */
  altLines?: Array<any>;
  /** Click handler for the badge */
  onBadgeClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Additional CSS class for the container */
  containerClassName?: string;
  /** Additional CSS class for the value */
  valueClassName?: string;
  /** Additional CSS class for the badge */
  badgeClassName?: string;
}

export const SpreadTotalContainer: React.FC<SpreadTotalContainerProps> = ({
  value,
  altLines = [],
  onBadgeClick,
  containerClassName = '',
  valueClassName = '',
  badgeClassName = ''
}) => {
  const containerClasses = `spread-total-container ${containerClassName}`.trim();
  const valueClasses = `spread-total-value ${valueClassName}`.trim();

  return (
    <div className={containerClasses}>
      <div className={valueClasses}>{value}</div>
      <AltLinesBadge 
        altLines={altLines} 
        onClick={onBadgeClick}
        className={badgeClassName}
      />
    </div>
  );
};

/**
 * Hook to check if alt lines exist
 */
export const useAltLines = (altLines?: Array<any>): boolean => {
  return React.useMemo(() => {
    return Array.isArray(altLines) && altLines.length > 0;
  }, [altLines]);
};
