export * from './errors';
export * from './responses';

export const parseBool = (
  value: string | undefined,
  fallback: boolean,
): boolean => {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
};
