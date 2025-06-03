
import { useCallback } from 'react';

export interface PointerEvent {
  clientX: number;
  clientY: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export const usePointerEvents = () => {
  const getPointerEvent = useCallback((e: React.MouseEvent | React.TouchEvent): PointerEvent => {
    if ('touches' in e && e.touches.length > 0) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      };
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      return {
        clientX: e.changedTouches[0].clientX,
        clientY: e.changedTouches[0].clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      };
    } else {
      const mouseEvent = e as React.MouseEvent;
      return {
        clientX: mouseEvent.clientX,
        clientY: mouseEvent.clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      };
    }
  }, []);

  const addPointerEventListeners = useCallback((
    element: HTMLElement,
    onPointerMove: (e: PointerEvent) => void,
    onPointerEnd: (e: PointerEvent) => void
  ) => {
    const handleMouseMove = (e: MouseEvent) => {
      onPointerMove({
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      onPointerEnd({
        clientX: e.clientX,
        clientY: e.clientY,
        preventDefault: () => e.preventDefault(),
        stopPropagation: () => e.stopPropagation(),
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onPointerMove({
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
        });
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        onPointerEnd({
          clientX: e.changedTouches[0].clientX,
          clientY: e.changedTouches[0].clientY,
          preventDefault: () => e.preventDefault(),
          stopPropagation: () => e.stopPropagation(),
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { getPointerEvent, addPointerEventListeners };
};
