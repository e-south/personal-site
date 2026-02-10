/*
--------------------------------------------------------------------------------
personal-site
src/test/readStylesheetBundle.ts

Loads a stylesheet and its @import tree for source-contract style tests.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const IMPORT_PATTERN = /@import\s+['"]([^'"]+)['"];/g;

const normalizeToWorkspaceRelative = (absolutePath: string) =>
  path.relative(process.cwd(), absolutePath);

export const readStylesheetBundle = async (
  relativePath: string,
  visited = new Set<string>(),
): Promise<string> => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  if (visited.has(absolutePath)) {
    return '';
  }
  visited.add(absolutePath);

  const stylesheet = await readFile(absolutePath, 'utf-8');
  let bundle = stylesheet;

  const imports = Array.from(stylesheet.matchAll(IMPORT_PATTERN));
  for (const [, importPath] of imports) {
    const importedAbsolutePath = path.resolve(
      path.dirname(absolutePath),
      importPath,
    );
    const importedRelativePath =
      normalizeToWorkspaceRelative(importedAbsolutePath);
    bundle += `\n${await readStylesheetBundle(importedRelativePath, visited)}`;
  }

  return bundle;
};
