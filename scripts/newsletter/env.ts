import { loadEnv } from 'vite';

type LoadEnvOptions = {
  cwd?: string;
  mode?: string;
};

export const loadCliEnv = (options: LoadEnvOptions = {}) => {
  const cwd = options.cwd ?? process.cwd();
  const mode = options.mode ?? process.env.NODE_ENV ?? 'development';
  const env = loadEnv(mode, cwd, '');

  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return env;
};

export const requireEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const requireUrl = (
  key: string,
  options: { allowPath?: boolean } = {},
) => {
  const value = requireEnv(key).trim();
  try {
    const parsed = new URL(value);
    if (options.allowPath === false) {
      if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
        throw new Error(
          `${key} must not include a path/query/fragment (use PUBLIC_BASE_PATH instead).`,
        );
      }
    }
    return parsed.toString().replace(/\/+$/, '');
  } catch (error) {
    if (error instanceof Error && error.message.includes(key)) {
      throw error;
    }
    throw new Error(`${key} must be a valid absolute URL.`);
  }
};

export const parsePositiveInt = (value: string, label: string) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer.`);
  }
  return parsed;
};
