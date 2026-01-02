export const hashToHue = (value: string): number =>
  Array.from(value).reduce(
    (acc, char) => (acc * 31 + char.charCodeAt(0)) % 360,
    0,
  );
