import { z } from 'zod';

import { parseWithOptionals } from './parse.js';

describe('parse', () => {
  it('parses arguments without optionals', () => {
    expect(parseWithOptionals([1, 2], z.tuple([z.number(), z.number()]))).toEqual([1, 2]);
  });

  it('handles providing all optional arguments', () => {
    const schema = z.tuple([z.number(), z.number().optional(), z.number().optional()]);
    expect(parseWithOptionals([1, 2, 3], schema)).toEqual([1, 2, 3]);
  });

  it('handles some missing optional arguments', () => {
    const schema = z.tuple([z.number(), z.number().optional(), z.number().optional()]);
    expect(parseWithOptionals([1, 2], schema)).toEqual([1, 2, undefined]);
  });

  it('handles all missing optional arguments', () => {
    const schema = z.tuple([z.number(), z.number().optional(), z.number().optional()]);
    expect(parseWithOptionals([1], schema)).toEqual([1, undefined, undefined]);
  });

  it('handles no arguments if all optional', () => {
    const schema = z.tuple([z.number().optional(), z.number().optional(), z.number().optional()]);
    expect(parseWithOptionals([], schema)).toEqual([undefined, undefined, undefined]);
  });

  it('fails if a required argument is missing', () => {
    const schema = z.tuple([z.number(), z.number(), z.number().optional()]);
    expect(() => parseWithOptionals([1], schema)).toThrow();
  });
});
