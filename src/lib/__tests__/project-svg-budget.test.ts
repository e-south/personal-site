/*
--------------------------------------------------------------------------------
personal-site
src/lib/__tests__/project-svg-budget.test.ts

Enforces source SVG byte budgets for project banner assets.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const bytes = async (relativePath: string) =>
  (await stat(path.resolve(process.cwd(), relativePath))).size;

describe('project svg budget', () => {
  it('keeps key project SVG assets within practical transfer budgets', async () => {
    const crickWorkflowBytes = await bytes(
      'src/content/projects/synthetic-microbial-communities/CrickYeastPhysicalWorkflow.svg',
    );
    const limoneneOverviewBytes = await bytes(
      'src/content/projects/industrial-strain-engineering/DunlopLimoneneOverview.svg',
    );
    const stressPromoterBytes = await bytes(
      'src/content/projects/sequence-to-expression/StressPromotersActiveLearning.svg',
    );

    expect(crickWorkflowBytes).toBeLessThan(900_000);
    expect(limoneneOverviewBytes).toBeLessThan(220_000);
    expect(stressPromoterBytes).toBeLessThan(120_000);
  });
});
