import { parseArgs } from 'node:util';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ensureIsoDate, formatLocalISODate, yamlString } from './utils';

type CvArgs = {
  date?: string;
  'cv-path'?: string;
};

const args = parseArgs({
  options: {
    date: { type: 'string' },
    'cv-path': { type: 'string' },
  },
});

const values = args.values as CvArgs;

export const updateCvFrontmatter = (content: string, updated: string) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    throw new Error('CV file must start with frontmatter.');
  }

  const lines = match[1].split('\n');
  const updatedLine = `updated: ${yamlString(updated)}`;
  const existingIndex = lines.findIndex((line) =>
    line.trim().startsWith('updated:'),
  );

  if (existingIndex >= 0) {
    lines[existingIndex] = updatedLine;
  } else {
    const titleIndex = lines.findIndex((line) =>
      line.trim().startsWith('title:'),
    );
    const insertIndex = titleIndex >= 0 ? titleIndex + 1 : lines.length;
    lines.splice(insertIndex, 0, updatedLine);
  }

  return content.replace(match[0], `---\n${lines.join('\n')}\n---\n`);
};

const main = async () => {
  const date = values.date
    ? ensureIsoDate(values.date.trim())
    : formatLocalISODate();

  const cvPath = values['cv-path']?.trim()
    ? path.resolve(process.cwd(), values['cv-path'])
    : path.join(process.cwd(), 'src', 'content', 'cv', 'cv.md');

  if (!existsSync(cvPath)) {
    throw new Error(`CV file not found at ${cvPath}`);
  }

  const pdfPath = path.join(process.cwd(), 'public', 'cv', 'Eric_South_CV.pdf');
  if (!existsSync(pdfPath)) {
    console.warn(
      'CV PDF not found at public/cv/Eric_South_CV.pdf. Add it to enable the embedded PDF.',
    );
  }

  const content = await fs.readFile(cvPath, 'utf-8');
  const updatedContent = updateCvFrontmatter(content, date);
  await fs.writeFile(cvPath, updatedContent, 'utf-8');

  console.log(`Updated CV date in ${cvPath}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
