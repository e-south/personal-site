export const requireEntry = <T>(
  entry: T | null | undefined,
  label: string,
): T => {
  if (entry === null || entry === undefined) {
    throw new Error(`Missing content entry: ${label}.`);
  }
  return entry;
};

export const requireValue = <T>(
  value: T | null | undefined | '',
  label: string,
): T => {
  if (value === null || value === undefined || value === '') {
    throw new Error(`Missing required value: ${label}.`);
  }
  return value;
};
