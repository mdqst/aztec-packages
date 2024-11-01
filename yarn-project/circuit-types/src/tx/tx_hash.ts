import { Buffer32 } from '@aztec/foundation/buffer';
import { schemas } from '@aztec/foundation/schemas';

/**
 * A class representing hash of Aztec transaction.
 */
export class TxHash extends Buffer32 {
  constructor(
    /** The buffer containing the hash. */
    hash: Buffer,
  ) {
    super(hash);
  }

  static get schema() {
    return schemas.Buffer32;
  }
}
