const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
});

export const parseISODate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
};

export const formatDateRange = (start: string, end?: string | null) => {
  const startLabel = formatter.format(parseISODate(start));
  const endLabel = end ? formatter.format(parseISODate(end)) : 'Present';
  return `${startLabel} - ${endLabel}`;
};
