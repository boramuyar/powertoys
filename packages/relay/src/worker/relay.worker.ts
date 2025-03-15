/// <reference lib="webworker" />

// Define the worker scope
const worker = self as unknown as SharedWorkerGlobalScope;

// Interface for tab info with port
interface TabInfoInternal {
  tabId: string;
  tabName: string;
  port: MessagePort;
  lastHeartbeat: number;
  isActive: boolean;
}

// Define message types (these should match the types in the main library)
interface BaseMessage {
  type: string;
}

interface RegisterMessage extends BaseMessage {
  type: "REGISTER";
  tabId: string;
  tabName: string;
}

interface HeartbeatMessage extends BaseMessage {
  type: "HEARTBEAT";
  tabId: string;
}

interface GetTabListMessage extends BaseMessage {
  type: "GET_TAB_LIST";
}

interface RequestActionMessage extends BaseMessage {
  type: "REQUEST_ACTION";
  targetTabId: string;
  action: string;
  requestId: string;
  payload?: any;
}

interface ActionResponseMessage extends BaseMessage {
  type: "ACTION_RESPONSE";
  requestId: string;
  requestorId: string;
  result: any;
}

interface UnregisterMessage extends BaseMessage {
  type: "UNREGISTER";
  tabId: string;
}

type OutgoingWorkerMessage =
  | RegisterMessage
  | HeartbeatMessage
  | GetTabListMessage
  | RequestActionMessage
  | ActionResponseMessage
  | UnregisterMessage;

interface TabListItem {
  tabId: string;
  tabName: string;
  lastSeen: number;
}

// Storage for connections and tab registry
const connections = new Map<string, MessagePort>();
const tabRegistry = new Map<string, TabInfoInternal>();
const HEARTBEAT_TIMEOUT = 15000; // 15 seconds timeout for heartbeats

console.log(`Relay worker started at ${new Date().toISOString()}`);

// Handle new connections
worker.onconnect = function (e: MessageEvent): void {
  const port = e.ports[0];
  let tabId: string | null = null;
  let isPortActive = true;

  console.log("New connection to worker established");

  port.onmessage = function (event: MessageEvent): void {
    const message = event.data as OutgoingWorkerMessage;

    if (!isPortActive) {
      console.log("Port is not active, ignoring message");
      return;
    }

    switch (message.type) {
      case "REGISTER":
        console.log("Registering tab:", message.tabId, message.tabName);

        if (tabRegistry.has(message.tabId)) {
          console.log("Tab already registered, cleaning up old connection");
          unregisterClient(message.tabId);
        }
        // Register a new tab with the system
        tabId = message.tabId;
        if (tabId === "*") console.error("Tab ID cannot be *, use * to broadcast to all clients");
        tabId = crypto.randomUUID().slice(-8);
        console.warn("Using random tab ID:", tabId);
        const tabInfo: TabInfoInternal = {
          tabId: tabId,
          tabName: message.tabName,
          port: port,
          lastHeartbeat: Date.now(),
          isActive: true,
        };

        // Broadcast registration to all clients
        broadcastRegistration(tabId, message.tabName);

        connections.set(tabId, port);
        tabRegistry.set(tabId, tabInfo);

        // Broadcast updated tab list to all connected clients
        broadcastTabList();
        break;

      case "HEARTBEAT":
        // Update the last heartbeat time for this tab
        if (message.tabId && tabRegistry.has(message.tabId)) {
          const tabInfo = tabRegistry.get(message.tabId)!;
          tabInfo.lastHeartbeat = Date.now();
          tabRegistry.set(message.tabId, tabInfo);
        }
        break;

      case "GET_TAB_LIST":
        // Send the current tab list to the requesting client
        port.postMessage({
          type: "TAB_LIST",
          tabs: getTabListForClients(),
        });
        break;

      case "REQUEST_ACTION":
        // Handle a request from one client to another
        const targetPort = connections.get(message.targetTabId);
        if (targetPort && tabId) {
          // Forward the request to the target client
          targetPort.postMessage({
            type: "ACTION_REQUEST",
            action: message.action,
            requestId: message.requestId,
            requestorId: tabId,
            payload: message.payload,
          });
        } else if (tabId) {
          // If the target tab id is *, forward the request to all clients.
          if (message.targetTabId === "*") {
            const ports = Array.from(connections.values()).filter(p => p !== port);
            ports.forEach(p => {
              p.postMessage({
                type: "ACTION_REQUEST",
                action: message.action,
                requestId: message.requestId,
                requestorId: tabId,
                payload: message.payload,
              });
            });
          } else {
            // Notify requestor that target is not available
            port.postMessage({
              type: "ACTION_ERROR",
              requestId: message.requestId,
              error: "Target tab not available",
            });
          }
        }
        break;

      case "ACTION_RESPONSE":
        // Forward the response back to the original requestor
        const requestorPort = connections.get(message.requestorId);
        if (requestorPort) {
          requestorPort.postMessage({
            type: "ACTION_RESULT",
            requestId: message.requestId,
            result: message.result,
          });
        }
        break;

      case "UNREGISTER":
        console.log("Explicit unregister:", message.tabId);
        if (message.tabId) {
          unregisterClient(message.tabId);
          if (message.tabId === tabId) {
            isPortActive = false;
          }
        }
        break;
    }
  };

  function handlePortClosure() {
    console.log(`Port closed for tab ${tabId}`);
    if (tabId && isPortActive) {
      unregisterClient(tabId);
      isPortActive = false;
    }
  }

  // Handle disconnection
  port.onmessageerror = function (): void {
    console.log("Message error on port");
    handlePortClosure();
  };

  port.start();
};

// Function to unregister a client
function unregisterClient(tabId: string): void {
  console.log("Unregistering client:", tabId);
  const tabInfo = tabRegistry.get(tabId);

  connections.delete(tabId);
  tabRegistry.delete(tabId);

  if (tabInfo && tabInfo.port) {
    try {
      tabInfo.port.close();
    } catch (err) {
      console.error("Error closing port:", err);
    }
  }
  broadcastTabList();
  console.log(`Tab unregistered. Current tabs: ${tabRegistry.size}`);
}

// Check for stale connections
function checkStaleConnections(): void {
  const now = Date.now();
  let hasStaleConnections = false;

  tabRegistry.forEach((tabInfo, tabId) => {
    if (now - tabInfo.lastHeartbeat > HEARTBEAT_TIMEOUT) {
      // This connection is stale, remove it
      console.log(`Stale connection detected for tab ${tabId}, last seen ${(now - tabInfo.lastHeartbeat) / 1000}s ago`);
      unregisterClient(tabId);
      hasStaleConnections = true;
    }
  });

  if (hasStaleConnections) {
    broadcastTabList();
  }
}

// Start periodic checks for stale connections
setInterval(checkStaleConnections, 10000); // Check every 10 seconds

setInterval(() => {
  console.log(`Worker status: ${tabRegistry.size} active tabs`);
  if (tabRegistry.size > 0) {
    console.log(
      "Active tabs:",
      Array.from(tabRegistry.entries())
        .map(([id, info]) => `${id} (${info.tabName}) - last seen ${(Date.now() - info.lastHeartbeat) / 1000}s ago`)
        .join(", ")
    );
  }
}, 10000);

// Function to get tab list for clients (excluding port information)
function getTabListForClients(): TabListItem[] {
  return Array.from(tabRegistry.values()).map(tab => ({
    tabId: tab.tabId,
    tabName: tab.tabName,
    lastSeen: tab.lastHeartbeat,
  }));
}

// Function to broadcast the current tab list to all connected clients
function broadcastTabList(): void {
  const tabList = getTabListForClients();

  connections.forEach(port => {
    port.postMessage({
      type: "TAB_LIST",
      tabs: tabList,
    });
  });
}

// Function to broadcast new registration to all clients
function broadcastRegistration(tabId: string, tabName: string): void {
  connections.forEach(port => {
    port.postMessage({
      type: "REGISTRATION",
      tabId: tabId,
      tabName: tabName,
    });
  });
}
