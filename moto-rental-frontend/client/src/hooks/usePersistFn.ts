import { useRef } from "react";

type PersistFn<TArgs extends unknown[] = unknown[], TResult = unknown> = (...args: TArgs) => TResult;

/**
 * usePersistFn instead of useCallback to reduce cognitive load
 */
export function usePersistFn<TArgs extends unknown[], TResult>(fn: PersistFn<TArgs, TResult>) {
  type T = PersistFn<TArgs, TResult>;
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T | null>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
      return fnRef.current.apply(this, args) as ReturnType<T>;
    } as T;
  }

  return persistFn.current as T;
}
