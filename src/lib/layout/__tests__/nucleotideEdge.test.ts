/*
--------------------------------------------------------------------------------
personal-site
src/lib/layout/__tests__/nucleotideEdge.test.ts

Validates nucleotide edge sequence generation and permutation helpers.

Module Author(s): Eric J. South
--------------------------------------------------------------------------------
*/

import { describe, expect, it } from 'vitest';
import {
  buildNucleotideSequence,
  permuteNucleotideSequence,
} from '../nucleotideEdge';

const makeDeterministicRandom = (values: number[]) => {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
};

describe('nucleotideEdge helpers', () => {
  it('builds a contiguous ATCG string at the requested length', () => {
    const random = makeDeterministicRandom([0.01, 0.26, 0.51, 0.76]);
    const sequence = buildNucleotideSequence(48, random);
    expect(sequence).toHaveLength(48);
    expect(sequence).toMatch(/^[ATCG]+$/);
    expect(sequence).toContain('ATCG');
  });

  it('permutes letters without changing string length or alphabet contract', () => {
    const base = 'ATCGATCGATCGATCG';
    const random = makeDeterministicRandom([
      0.2, 0.9, 0.6, 0.3, 0.1, 0.8, 0.4, 0.7,
    ]);
    const permuted = permuteNucleotideSequence(base, 6, random);

    expect(permuted).toHaveLength(base.length);
    expect(permuted).toMatch(/^[ATCG]+$/);
    expect(permuted).not.toBe(base);
  });
});
