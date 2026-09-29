import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useCallback, CSSProperties } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerRef?: React.RefObject<HTMLDivElement>;
  overscan?: number;
  className?: string;
  style?: CSSProperties;
  emptyMessage?: string;
}

/**
 * Virtualized list component using @tanstack/react-virtual
 * Renders only visible items for performance with large lists
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  containerRef,
  overscan = 5,
  className = '',
  style,
  emptyMessage = 'No items to display',
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      parentRef.current = node;
      if (containerRef && 'current' in containerRef) {
        containerRef.current = node;
      }
    },
    [containerRef]
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    paddingStart: 0,
    paddingEnd: 0,
  });

  if (items.length === 0) {
    return (
      <div ref={mergedRef} className={`virtualized-list ${className}`} style={style}>
        <div className="virtualized-empty" style={{ padding: '2rem', textAlign: 'center' }}>
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mergedRef}
      className={`virtualized-list ${className}`}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hook for creating a virtualizer with common options
 */
export function useVirtualizerList<T>(
  items: T[],
  options: {
    itemHeight: number;
    overscan?: number;
    getScrollElement?: () => HTMLElement | null;
  }
) {
  return useVirtualizer({
    count: items.length,
    estimateSize: () => options.itemHeight,
    overscan: options.overscan ?? 5,
    getScrollElement: options.getScrollElement,
    paddingStart: 0,
    paddingEnd: 0,
  });
}

export default VirtualizedList;