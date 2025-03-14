import { createRelayWorker } from "../worker/worker.util";
import { Observable, Subscriber } from "./observer";
import {
  TabInfo,
  TabListItem,
  ActionHandlerMap,
  IncomingWorkerMessage,
  OutgoingWorkerMessage,
  PendingRequest,
  TabCommunicatorEvent,
  ActionRequestMessage,
} from "../types";

export interface RelayOptions {
  handlers?: ActionHandlerMap;
  getTabInfo?: () => Promise<TabInfo>;
  heartbeatInterval?: number;
  workerUrl?: string;
}

let sharedWorkerInstance: SharedWorker | null = null;

export class Relay {
  private port: MessagePort | null = null;
  private tabInfo: TabInfo | null = null;
  private heartbeatInterval: number | null = null;
  private requestIdCounter = 0;
  private pendingRequests = new Map<string, PendingRequest>();
  private handlers: ActionHandlerMap;
  private isInitialized = false;
  private options: RelayOptions;

  // Observables for different events
  private events$ = new Observable<TabCommunicatorEvent>();
  private tabList$ = new Observable<TabListItem[]>();

  constructor(options: RelayOptions) {
    this.options = {
      heartbeatInterval: 10000, // Default to 10 seconds
      ...options,
    };
    this.handlers = options.handlers ?? {};

    // Log to help debug multiple instances
  }

  /**
   * Initialize the tab communicator
   * @returns A promise that resolves when initialization is complete
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Get tab info
      if (this.options.getTabInfo) {
        this.tabInfo = await this.options.getTabInfo();
      } else {
        const uuid = crypto.randomUUID();
        this.tabInfo = {
          tabId: uuid,
          tabName: `Tab ${uuid.slice(-8)}`,
        };
      }

      // Create shared worker
      // this.worker = createRelayWorker(this.options.workerUrl);
      // if (!this.worker) {
      //   throw new Error("Failed to create shared worker");
      // }

      if (!sharedWorkerInstance) {
        sharedWorkerInstance = createRelayWorker(this.options.workerUrl);
        if (!sharedWorkerInstance) {
          throw new Error("Failed to create shared worker");
        }
        console.log("Created new SharedWorker instance");
      } else {
        console.log("Reusing existing SharedWorker instance");
      }

      this.port = sharedWorkerInstance.port;

      // Set up message handler
      this.port.onmessage = this.handleWorkerMessage.bind(this);

      // Start the port
      this.port.start();

      // Register this tab with the shared worker
      this.sendMessage({
        type: "REGISTER",
        tabId: this.tabInfo.tabId,
        tabName: this.tabInfo.tabName,
      });

      // Set up heartbeat interval
      this.heartbeatInterval = window.setInterval(() => {
        this.sendHeartbeat();
      }, this.options.heartbeatInterval);

      // Update state
      this.isInitialized = true;

      // Notify subscribers
      this.events$.next({
        type: "connected",
        tabInfo: this.tabInfo,
      });

      // Get tab list
      this.getTabList();

      // Set up cleanup on unload
      window.addEventListener("beforeunload", this.cleanup.bind(this));
      // window.addEventListener("unload", this.cleanup.bind(this));
      // window.addEventListener("pagehide", this.cleanup.bind(this));

      // document.addEventListener("visibilitychange", () => {
      //   if (document.visibilityState === "hidden") {
      //     // Store timestamp when hidden
      //     this.lastHidden = Date.now();
      //   } else if (document.visibilityState === "visible") {
      //     // If we were hidden for more than 5 seconds, reinitialize
      //     if (this.lastHidden && Date.now() - this.lastHidden > 5000) {
      //       this.cleanup();
      //       this.initialize();
      //     }
      //   }
      // });
    } catch (error) {
      console.error("Failed to initialize tab communicator:", error);
      throw error;
    }
  }

  /**
   * Send a heartbeat to keep the connection alive
   */
  private sendHeartbeat(): void {
    if (!this.tabInfo) return;

    this.sendMessage({
      type: "HEARTBEAT",
      tabId: this.tabInfo.tabId,
    });
  }

  /**
   * Get the list of open tabs
   */
  public getTabList(): void {
    this.sendMessage({
      type: "GET_TAB_LIST",
    });
  }

  /**
   * Request an action to be performed by another tab
   * @param targetTabId The ID of the target tab
   * @param action The action to perform
   * @param payload The payload for the action
   * @param onSuccess Optional callback for success
   * @param onError Optional callback for error
   * @returns The request ID or null if failed
   */
  public requestAction<TResult = any>(
    targetTabId: string,
    action: string,
    payload?: any,
    onSuccess?: (result: TResult) => void,
    onError?: (error: string) => void
  ): string | null {
    if (!this.port || !this.tabInfo) {
      if (onError) onError("Not connected to shared worker");
      return null;
    }

    const requestId = `req_${this.tabInfo.tabId}_${++this.requestIdCounter}`;

    this.pendingRequests.set(requestId, {
      targetTabId,
      action,
      payload,
      onSuccess,
      onError,
    });

    this.sendMessage({
      type: "REQUEST_ACTION",
      targetTabId,
      action,
      requestId,
      payload,
    });

    return requestId;
  }

  /**
   * Handle an action request from another tab
   * @param message The action request message
   */
  private async handleActionRequest(message: ActionRequestMessage): Promise<void> {
    if (!this.port) return;

    const { requestId, requestorId, action, payload } = message;

    try {
      let result;

      if (this.handlers[action]) {
        result = await this.handlers[action](payload, requestId, requestorId);
      } else {
        throw new Error(`Unknown action: ${action}`);
      }

      // Send the response back
      this.sendMessage({
        type: "ACTION_RESPONSE",
        requestId,
        requestorId,
        result,
      });
    } catch (error) {
      // Send error response
      this.sendMessage({
        type: "ACTION_RESPONSE",
        requestId,
        requestorId,
        result: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  /**
   * Handle messages from the shared worker
   * @param event The message event
   */
  private handleWorkerMessage(event: MessageEvent): void {
    const message = event.data as IncomingWorkerMessage;

    switch (message.type) {
      case "TAB_LIST":
        this.tabList$.next(message.tabs);
        this.events$.next({
          type: "tabListUpdated",
          tabs: message.tabs,
        });
        break;

      case "REGISTRATION":
        this.events$.next({
          type: "tabRegistered",
          tabId: message.tabId,
          tabName: message.tabName,
        });
        break;

      case "ACTION_RESULT":
        // Handle the result of a request made to another client
        const request = this.pendingRequests.get(message.requestId);
        if (request) {
          this.pendingRequests.delete(message.requestId);

          this.events$.next({
            type: "actionResult",
            requestId: message.requestId,
            result: message.result,
          });

          if (request.onSuccess) {
            request.onSuccess(message.result);
          }
        }
        break;

      case "ACTION_ERROR":
        // Handle errors from requests
        const failedRequest = this.pendingRequests.get(message.requestId);
        if (failedRequest && failedRequest.onError) {
          this.pendingRequests.delete(message.requestId);
          failedRequest.onError(message.error);
        }
        break;

      case "ACTION_REQUEST":
        // Handle requests from other clients
        this.handleActionRequest(message);
        break;
    }
  }

  /**
   * Send a message to the shared worker
   * @param message The message to send
   */
  private sendMessage(message: OutgoingWorkerMessage): void {
    if (this.port) {
      this.port.postMessage(message);
    }
  }

  /**
   * Clean up the tab communicator
   */
  public cleanup(): void {
    console.log(`Cleaning up Relay instance ${this.tabInfo?.tabId}`);

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.port && this.tabInfo) {
      this.sendMessage({
        type: "UNREGISTER",
        tabId: this.tabInfo.tabId,
      });

      this.port.close();
      this.port = null;
    }

    sharedWorkerInstance = null;

    this.pendingRequests.clear();
    this.requestIdCounter = 0;
    this.isInitialized = false;

    this.events$.next({
      type: "disconnected",
    });
  }

  /**
   * Subscribe to all events
   * @param subscriber The subscriber function or object
   * @returns An unsubscribe function
   */
  public onEvent(subscriber: Subscriber<TabCommunicatorEvent>): () => void {
    return this.events$.subscribe(subscriber);
  }

  /**
   * Subscribe to tab list updates
   * @param subscriber The subscriber function or object
   * @returns An unsubscribe function
   */
  public onTabListUpdated(subscriber: Subscriber<TabListItem[]>): () => void {
    return this.tabList$.subscribe(subscriber);
  }

  /**
   * Get the tab info for this tab
   * @returns The tab info
   */
  public getTabInfo(): TabInfo | null {
    return this.tabInfo;
  }

  /**
   * Check if the tab communicator is initialized
   * @returns True if initialized
   */
  public isConnected(): boolean {
    return this.isInitialized;
  }
}
