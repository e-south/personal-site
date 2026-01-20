const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

const longFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export const parseISODate = (value: string) => {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new Error(`Invalid date: ${value}`);
    }
    return date;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
};

export const formatLongDate = (value: Date) => longFormatter.format(value);

export const formatDateRange = (start: string, end?: string | null) => {
  const startLabel = formatter.format(parseISODate(start));
  const endLabel = end ? formatter.format(parseISODate(end)) : 'Present';
  return `${startLabel} - ${endLabel}`;
};
