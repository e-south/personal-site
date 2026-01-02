import { afterEach, describe, expect, it } from 'vitest';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { loadCliEnv } from '../env';

const resetEnv = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

const originalEnv = {
  TEST_ENV_VALUE: process.env.TEST_ENV_VALUE,
  TEST_OVERRIDE: process.env.TEST_OVERRIDE,
};

afterEach(() => {
  resetEnv('TEST_ENV_VALUE', originalEnv.TEST_ENV_VALUE);
  resetEnv('TEST_OVERRIDE', originalEnv.TEST_OVERRIDE);
});

const withTempEnv = async (
  content: string,
  run: (dir: string) => Promise<void> | void,
) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'newsletter-env-'));
  try {
    await fs.writeFile(path.join(dir, '.env'), content);
    await run(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

describe('loadCliEnv', () => {
  it('loads env values from .env when missing', async () => {
    delete process.env.TEST_ENV_VALUE;
    await withTempEnv('TEST_ENV_VALUE=fromfile\n', (dir) => {
      loadCliEnv({ cwd: dir, mode: 'test' });
    });

    expect(process.env.TEST_ENV_VALUE).toBe('fromfile');
  });

  it('does not override existing env values', async () => {
    process.env.TEST_OVERRIDE = 'fromshell';
    await withTempEnv('TEST_OVERRIDE=fromfile\n', (dir) => {
      loadCliEnv({ cwd: dir, mode: 'test' });
    });

    expect(process.env.TEST_OVERRIDE).toBe('fromshell');
  });
});
