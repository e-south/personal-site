/*
--------------------------------------------------------------------------------
personal-site
scripts/e2e/top-banner-chrome-smoke.mjs

Runs a Chrome smoke test for top-banner nucleotide interactions using a temporary
isolated browser profile so extensions from personal profiles cannot interfere.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

/* global document, HTMLElement */

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright-core';

const DEFAULT_BASE_URL = 'http://localhost:4321';
const SERVER_READY_TIMEOUT_MS = 60_000;
const SERVER_RETRY_INTERVAL_MS = 250;
const REQUEST_TIMEOUT_MS = 2_000;
const TOUCH_PREVIEW_SETTLE_WAIT_MS = 700;
const HEADER_INTERACTION_WAIT_MS = 220;

const sleep = (durationMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const parseBaseUrl = () => {
  const explicit = process.argv.find((arg) => arg.startsWith('--url='));
  if (explicit) {
    return explicit.slice('--url='.length);
  }
  return process.env.SMOKE_BASE_URL ?? DEFAULT_BASE_URL;
};

const buildCandidateBaseUrls = (baseUrl) => {
  const candidates = [baseUrl];

  try {
    const parsed = new URL(baseUrl);
    if (parsed.hostname === '127.0.0.1') {
      parsed.hostname = 'localhost';
      candidates.push(parsed.toString());
    } else if (parsed.hostname === 'localhost') {
      parsed.hostname = '127.0.0.1';
      candidates.push(parsed.toString());
    }
  } catch {
    return candidates;
  }

  return Array.from(new Set(candidates));
};

const isUrlReachable = async (url) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
};

const waitForUrl = async (url, timeoutMs) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isUrlReachable(url)) {
      return;
    }
    await sleep(SERVER_RETRY_INTERVAL_MS);
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const navigateWithFallback = async (page, candidateUrls) => {
  const blockedFailures = [];

  for (const candidateUrl of candidateUrls) {
    try {
      await page.goto(candidateUrl, { waitUntil: 'networkidle' });
      return candidateUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('ERR_BLOCKED_BY_CLIENT')) {
        blockedFailures.push(candidateUrl);
        continue;
      }
      throw error;
    }
  }

  if (blockedFailures.length > 0) {
    throw new Error(
      `Navigation blocked by client for: ${blockedFailures.join(', ')}`,
    );
  }

  throw new Error('Unable to navigate to any candidate smoke-test URL.');
};

const startDevServer = () => {
  const server = spawn(
    'npm',
    ['run', 'dev', '--', '--host', '127.0.0.1', '--port', '4321'],
    {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  server.stdout?.on('data', (chunk) => {
    const message = chunk.toString();
    if (process.env.SMOKE_DEBUG === '1') {
      process.stdout.write(`[dev] ${message}`);
    }
  });
  server.stderr?.on('data', (chunk) => {
    const message = chunk.toString();
    if (process.env.SMOKE_DEBUG === '1') {
      process.stderr.write(`[dev] ${message}`);
    }
  });

  return server;
};

const stopServer = async (server) => {
  if (!server || server.exitCode !== null) {
    return;
  }

  await new Promise((resolve) => {
    const forceKillTimeout = setTimeout(() => {
      server.kill('SIGKILL');
      resolve(undefined);
    }, 5_000);

    server.once('exit', () => {
      clearTimeout(forceKillTimeout);
      resolve(undefined);
    });

    server.kill('SIGTERM');
  });
};

const countActiveHoverCharacters = async (page) =>
  page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('.site-header-edge-char'),
    );
    return nodes.filter((node) => {
      return (
        node instanceof HTMLElement && node.style.textShadow.includes('hsla(')
      );
    }).length;
  });

const runSmoke = async () => {
  const baseUrl = parseBaseUrl();
  const candidateBaseUrls = buildCandidateBaseUrls(baseUrl);
  const preferredBaseUrl = candidateBaseUrls[0];
  let startedServer = false;
  let server = null;
  let context = null;
  const isolatedProfileDir = await mkdtemp(
    path.join(os.tmpdir(), 'personal-site-chrome-smoke-'),
  );

  try {
    const alreadyRunning = await isUrlReachable(preferredBaseUrl);
    if (!alreadyRunning) {
      startedServer = true;
      server = startDevServer();
      await waitForUrl(preferredBaseUrl, SERVER_READY_TIMEOUT_MS);
    }

    context = await chromium.launchPersistentContext(isolatedProfileDir, {
      channel: 'chrome',
      headless: process.env.HEADFUL !== '1',
      args: ['--disable-extensions', '--no-first-run'],
    });

    const page = context.pages()[0] ?? (await context.newPage());
    const activeBaseUrl = await navigateWithFallback(page, candidateBaseUrls);

    const edge = page.locator('[data-site-header-edge]');
    await edge.waitFor({ state: 'visible' });
    const chars = page.locator('.site-header-edge-char');
    await chars.first().waitFor({ state: 'visible' });
    const charCount = await chars.count();
    assert(
      charCount > 100,
      'Nucleotide edge did not render expected characters.',
    );

    const edgeBox = await edge.boundingBox();
    assert(edgeBox, 'Nucleotide edge is missing a measurable bounding box.');
    assert(
      edgeBox.width > 0 && edgeBox.height > 0,
      'Nucleotide edge bounds are invalid.',
    );

    const hoverX = edgeBox.x + edgeBox.width * 0.5;
    const hoverY = edgeBox.y + Math.max(1, edgeBox.height * 0.5);

    await page.mouse.move(hoverX, hoverY);
    await page.waitForTimeout(HEADER_INTERACTION_WAIT_MS);
    const hoverActive = await countActiveHoverCharacters(page);
    assert(
      hoverActive > 0,
      'Cursor hover did not activate nucleotide reaction.',
    );

    await page.dispatchEvent('[data-site-header]', 'pointerdown', {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'touch',
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: hoverX,
      clientY: hoverY,
    });
    await page.waitForTimeout(HEADER_INTERACTION_WAIT_MS);
    const touchPreviewActive = await countActiveHoverCharacters(page);
    assert(
      touchPreviewActive > 0,
      'Touch preview did not activate nucleotide reaction.',
    );

    await page.waitForTimeout(TOUCH_PREVIEW_SETTLE_WAIT_MS);
    const touchPreviewSettled = await countActiveHoverCharacters(page);
    assert(
      touchPreviewSettled === 0,
      'Touch preview did not clear after the expected timeout.',
    );

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.mouse.move(hoverX, hoverY);
    await page.waitForTimeout(HEADER_INTERACTION_WAIT_MS);
    const reducedMotionActive = await countActiveHoverCharacters(page);
    assert(
      reducedMotionActive === 0,
      'Reduced-motion mode still shows hover color-shift effects.',
    );

    process.stdout.write(
      `[smoke] passed on ${activeBaseUrl} using isolated Chrome profile ${isolatedProfileDir}\n`,
    );
  } finally {
    await context?.close();
    await rm(isolatedProfileDir, { recursive: true, force: true });
    if (startedServer) {
      await stopServer(server);
    }
  }
};

runSmoke().catch((error) => {
  const message =
    error instanceof Error ? error.message : 'Unknown smoke test failure.';
  process.stderr.write(`[smoke] failed: ${message}\n`);
  process.exitCode = 1;
});
