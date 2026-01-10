import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const shouldSkip = () => {
  if (process.env.HUSKY === '0') return 'HUSKY=0';
  if (process.env.CI === 'true') return 'CI=true';
  if (!fs.existsSync('.git')) return '.git missing';
  const gitConfig = path.join('.git', 'config');
  try {
    fs.accessSync(gitConfig, fs.constants.W_OK);
  } catch {
    return '.git/config not writable';
  }
  return '';
};

const reason = shouldSkip();
if (reason) {
  console.log(`[prepare] Skipping husky install (${reason}).`);
  process.exit(0);
}

try {
  execSync('husky install', { stdio: 'inherit' });
} catch (error) {
  console.warn('[prepare] Husky install failed; continuing.');
  if (error instanceof Error) {
    console.warn(error.message);
  }
}
