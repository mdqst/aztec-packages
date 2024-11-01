import { z } from 'zod';

import { times } from '../collection/array.js';

/** Parses the given arguments using a tuple from the provided schemas. */
export function parse<T extends [] | [z.ZodTypeAny, ...z.ZodTypeAny[]]>(args: IArguments, ...schemas: T) {
  return z.tuple(schemas).parse(args);
}

/** Parses the given arguments against a tuple, allowing empty for optional items. */
export function parseWithOptionals<T extends z.AnyZodTuple>(args: any[], schema: T): T['_output'] {
  // See https://github.com/colinhacks/zod/discussions/949
  const missingCount = schema.items.length - args.length;
  const optionalCount = schema.items.filter(item => item.isOptional()).length;
  const toParse = missingCount <= optionalCount ? args.concat(times(missingCount, () => undefined)) : args;
  return schema.parse(toParse);
}
