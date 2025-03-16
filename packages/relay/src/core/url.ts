import { WORKER_CODE } from "../worker/worker.util";

/**
 * Creates a blob URL from the inlined worker code
 * @returns The URL for the worker blob
 */
export function createWorkerBlobUrl(): string {
  // Check if the worker code has been replaced with the actual code
  if (WORKER_CODE !== "__WORKER_CODE_PLACEHOLDER__") {
    const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }
  throw new Error("Worker code not available");
}
