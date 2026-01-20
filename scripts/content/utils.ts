const pad2 = (value: number) => String(value).padStart(2, '0');

export const formatLocalISODate = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

export const ensureIsoDate = (value: string): string => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new Error('Date must be in YYYY-MM-DD format.');
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error(`Invalid date: ${value}`);
  }
  return value;
};

export const slugify = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  const normalized = trimmed
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!normalized) {
    throw new Error('Slug cannot be empty.');
  }
  return normalized;
};

export const yamlString = (value: string): string =>
  `'${value.replace(/'/g, "''")}'`;
