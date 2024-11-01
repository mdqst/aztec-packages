import { z } from 'zod';

import { ExtendedUnencryptedL2Log } from './extended_unencrypted_l2_log.js';

/** Response for the getUnencryptedLogs archiver call. */
export type GetUnencryptedLogsResponse = {
  /** An array of ExtendedUnencryptedL2Log elements. */
  logs: ExtendedUnencryptedL2Log[];
  /** Indicates if a limit has been reached. */
  maxLogsHit: boolean;
};

export const GetUnencryptedLogsResponseSchema = z.object({
  logs: z.array(ExtendedUnencryptedL2Log.schema),
  maxLogsHit: z.boolean(),
}) satisfies z.ZodType<GetUnencryptedLogsResponse, any, any>;
