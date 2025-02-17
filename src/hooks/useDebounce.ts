import { useRef, useCallback } from "react";

/**
 * Вызовет переданный callback через указанное время (мс)
 * @param callback - Функция, которую нужно вызвать
 * @param delay - Задержка в миллисекундах (по умолчанию 500 мс)
 */
export function useDebounce(callback: () => void, delay: number = 500) {
  const timer = useRef<number>();

  return useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = +setTimeout(() => {
      callback();
    }, delay);
  }, [callback, delay]);
}
