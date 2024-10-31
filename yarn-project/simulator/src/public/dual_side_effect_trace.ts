import {
  type CombinedConstantData,
  type ContractClassIdPreimage,
  type Gas,
  NullifierLeafPreimage,
  PublicDataTreeLeafPreimage,
  type SerializableContractInstance,
  type VMCircuitPublicInputs,
} from '@aztec/circuits.js';
import { type Fr } from '@aztec/foundation/fields';

import { assert } from 'console';

import { type AvmContractCallResult } from '../avm/avm_contract_call_result.js';
import { type AvmExecutionEnvironment } from '../avm/avm_execution_environment.js';
import { type PublicEnqueuedCallSideEffectTrace } from './enqueued_call_side_effect_trace.js';
import { type PublicExecutionResult } from './execution.js';
import { type PublicSideEffectTrace } from './side_effect_trace.js';
import { type PublicSideEffectTraceInterface } from './side_effect_trace_interface.js';

export class DualSideEffectTrace implements PublicSideEffectTraceInterface {
  constructor(
    public readonly innerCallTrace: PublicSideEffectTrace,
    public readonly enqueuedCallTrace: PublicEnqueuedCallSideEffectTrace,
  ) {}

  public fork() {
    return new DualSideEffectTrace(this.innerCallTrace.fork(), this.enqueuedCallTrace.fork());
  }

  public getCounter() {
    assert(this.innerCallTrace.getCounter() == this.enqueuedCallTrace.getCounter());
    return this.innerCallTrace.getCounter();
  }

  public tracePublicStorageRead(
    contractAddress: Fr,
    leafPreimage: PublicDataTreeLeafPreimage,
    leafIndex: Fr,
    path: Fr[],
  ) {
    this.innerCallTrace.tracePublicStorageRead(contractAddress, leafPreimage, leafIndex, path);
    this.enqueuedCallTrace.tracePublicStorageRead(contractAddress, leafPreimage, leafIndex, path);
  }

  public tracePublicStorageWrite(
    contractAddress: Fr,
    lowLeafPreimage: PublicDataTreeLeafPreimage,
    lowLeafIndex: Fr,
    lowLeafPath: Fr[],
    newLeafPreimage: PublicDataTreeLeafPreimage,
    insertionPath: Fr[],
  ) {
    this.innerCallTrace.tracePublicStorageWrite(
      contractAddress,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
      newLeafPreimage,
      insertionPath,
    );
    this.enqueuedCallTrace.tracePublicStorageWrite(
      contractAddress,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
      newLeafPreimage,
      insertionPath,
    );
  }

  // TODO(8287): _exists can be removed once we have the vm properly handling the equality check
  public traceNoteHashCheck(contractAddress: Fr, noteHash: Fr, leafIndex: Fr, exists: boolean, path: Fr[]) {
    this.innerCallTrace.traceNoteHashCheck(contractAddress, noteHash, leafIndex, exists, path);
    this.enqueuedCallTrace.traceNoteHashCheck(contractAddress, noteHash, leafIndex, exists, path);
  }

  public traceNewNoteHash(contractAddress: Fr, noteHash: Fr, leafIndex: Fr, path: Fr[]) {
    this.innerCallTrace.traceNewNoteHash(contractAddress, noteHash, leafIndex, path);
    this.enqueuedCallTrace.traceNewNoteHash(contractAddress, noteHash, leafIndex, path);
  }

  public traceNullifierCheck(
    contractAddress: Fr,
    nullifier: Fr,
    exists: boolean,
    lowLeafPreimage: NullifierLeafPreimage,
    lowLeafIndex: Fr,
    lowLeafPath: Fr[],
  ) {
    this.innerCallTrace.traceNullifierCheck(
      contractAddress,
      nullifier,
      exists,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
    );
    this.enqueuedCallTrace.traceNullifierCheck(
      contractAddress,
      nullifier,
      exists,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
    );
  }

  public traceNewNullifier(
    contractAddress: Fr,
    nullifier: Fr,
    lowLeafPreimage: NullifierLeafPreimage,
    lowLeafIndex: Fr,
    lowLeafPath: Fr[],
    insertionPath: Fr[],
  ) {
    this.innerCallTrace.traceNewNullifier(
      contractAddress,
      nullifier,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
      insertionPath,
    );
    this.enqueuedCallTrace.traceNewNullifier(
      contractAddress,
      nullifier,
      lowLeafPreimage,
      lowLeafIndex,
      lowLeafPath,
      insertionPath,
    );
  }

  traceL1ToL2MessageCheck(contractAddress: Fr, msgHash: Fr, msgLeafIndex: Fr, exists: boolean, path: Fr[]) {
    this.innerCallTrace.traceL1ToL2MessageCheck(contractAddress, msgHash, msgLeafIndex, exists, path);
    this.enqueuedCallTrace.traceL1ToL2MessageCheck(contractAddress, msgHash, msgLeafIndex, exists, path);
  }

  public traceNewL2ToL1Message(contractAddress: Fr, recipient: Fr, content: Fr) {
    this.innerCallTrace.traceNewL2ToL1Message(contractAddress, recipient, content);
    this.enqueuedCallTrace.traceNewL2ToL1Message(contractAddress, recipient, content);
  }

  public traceUnencryptedLog(contractAddress: Fr, log: Fr[]) {
    this.innerCallTrace.traceUnencryptedLog(contractAddress, log);
    this.enqueuedCallTrace.traceUnencryptedLog(contractAddress, log);
  }

  public traceGetContractInstance(
    contractAddress: Fr,
    exists: boolean,
    instance: SerializableContractInstance | undefined,
  ) {
    this.innerCallTrace.traceGetContractInstance(contractAddress, exists, instance);
    this.enqueuedCallTrace.traceGetContractInstance(contractAddress, exists, instance);
  }

  public traceGetBytecode(
    contractAddress: Fr,
    exists: boolean,
    bytecode: Buffer,
    contractInstance: SerializableContractInstance | undefined,
    contractClass: ContractClassIdPreimage | undefined,
  ) {
    this.innerCallTrace.traceGetBytecode(contractAddress, exists, bytecode, contractInstance, contractClass);
    this.enqueuedCallTrace.traceGetBytecode(contractAddress, exists, bytecode, contractInstance, contractClass);
  }

  /**
   * Trace a nested call.
   * Accept some results from a finished nested call's trace into this one.
   */
  public traceNestedCall(
    /** The trace of the nested call. */
    nestedCallTrace: this,
    /** The execution environment of the nested call. */
    nestedEnvironment: AvmExecutionEnvironment,
    /** How much gas was available for this public execution. */
    startGasLeft: Gas,
    /** How much gas was left after this public execution. */
    endGasLeft: Gas,
    /** Bytecode used for this execution. */
    bytecode: Buffer,
    /** The call's results */
    avmCallResults: AvmContractCallResult,
    /** Function name for logging */
    functionName: string = 'unknown',
  ) {
    this.innerCallTrace.traceNestedCall(
      nestedCallTrace.innerCallTrace,
      nestedEnvironment,
      startGasLeft,
      endGasLeft,
      bytecode,
      avmCallResults,
      functionName,
    );
    this.enqueuedCallTrace.traceNestedCall(
      nestedCallTrace.enqueuedCallTrace,
      nestedEnvironment,
      startGasLeft,
      endGasLeft,
      bytecode,
      avmCallResults,
      functionName,
    );
  }

  /**
   * Convert this trace to a PublicExecutionResult for use externally to the simulator.
   */
  public toPublicExecutionResult(
    /** The execution environment of the nested call. */
    avmEnvironment: AvmExecutionEnvironment,
    /** How much gas was available for this public execution. */
    startGasLeft: Gas,
    /** How much gas was left after this public execution. */
    endGasLeft: Gas,
    /** Bytecode used for this execution. */
    bytecode: Buffer,
    /** The call's results */
    avmCallResults: AvmContractCallResult,
    /** Function name for logging */
    functionName: string = 'unknown',
  ): PublicExecutionResult {
    return this.innerCallTrace.toPublicExecutionResult(
      avmEnvironment,
      startGasLeft,
      endGasLeft,
      bytecode,
      avmCallResults,
      functionName,
    );
  }

  public toVMCircuitPublicInputs(
    /** Constants */
    constants: CombinedConstantData,
    /** The execution environment of the nested call. */
    avmEnvironment: AvmExecutionEnvironment,
    /** How much gas was available for this public execution. */
    startGasLeft: Gas,
    /** How much gas was left after this public execution. */
    endGasLeft: Gas,
    /** The call's results */
    avmCallResults: AvmContractCallResult,
  ): VMCircuitPublicInputs {
    return this.enqueuedCallTrace.toVMCircuitPublicInputs(
      constants,
      avmEnvironment,
      startGasLeft,
      endGasLeft,
      avmCallResults,
    );
  }
}
