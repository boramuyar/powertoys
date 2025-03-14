/**
 * Creates a SharedWorker with the provided URL
 * @param config Configuration options
 * @returns SharedWorker instance or null if SharedWorker is not supported
 */
export function createRelayWorker(url?: string): SharedWorker | null {
  // Only create a worker in a browser environment
  if (typeof SharedWorker !== "undefined") {
    try {
      // Use the provided URL or fall back to environment variable if available
      // Note: process.env.RELAY_WORKER_URL will be replaced at build time
      // by the consuming application's build tool (see vite.config.js)
      const workerUrl =
        url || (typeof process !== "undefined" && process.env.RELAY_WORKER_URL) || "/workers/relay.worker.js";

      // Use the provided name or fall back to default UUID
      const workerName = "powertoys-relay-worker";

      // Create the worker
      return new SharedWorker(workerUrl, { name: workerName });
    } catch (error) {
      console.error("Failed to create shared worker:", error);
      return null;
    }
  }
  return null;
}
