# @PowerToys/Relay

A lightweight, TypeScript-first library for communication between browser tabs. This library enables seamless interaction between multiple open tabs/windows of your application using SharedWorker.

## Key Features

- **Type-Safe**: Full TypeScript support with extensive type definitions
- **Framework Agnostic**: Core functionality works with any JavaScript framework
- **React Integration**: Built-in React hooks and context for easy integration
- **Action-Based Communication**: Define and execute actions across tabs
- **Observable Pattern**: Custom observable implementation (no RxJS dependency)
- **Heartbeat System**: Automatic detection of closed or disconnected tabs
- **Minimal Dependencies**: Zero external runtime dependencies
- **Extensible**: Easy to add custom action handlers and extend functionality

## Installation

```bash
pnpm add @powertoys/relay

npm install @powertoys/relay

yarn add @powertoys/relay
```

## Basic Usage

### 1. Define Your Action Handlers

```typescript
// handlers/worksheet-handlers.ts
import { ActionHandler } from "@powertoys/relay";

export interface SelectRangePayload {
  address: string;
  sheetName?: string;
}

const selectRange: ActionHandler<SelectRangePayload, void> = async payload => {
  const { address, sheetName } = payload;
  // Implementation...
};

export const worksheetHandlers = {
  SELECT_RANGE: selectRange,
};

// handlers/workbook-handlers.ts
export interface WorkbookInfo {
  name: string;
  sheets: string[];
}

const getWorkbookInfo: ActionHandler<void, WorkbookInfo> = async () => {
  // Implementation...
  return {
    name: "Example Workbook",
    sheets: ["Sheet1", "Sheet2"],
  };
};

export const workbookHandlers = {
  GET_WORKBOOK_INFO: getWorkbookInfo,
};
```

### 2. Initialize the Relay

```typescript
// Function to generate tab info (optional)
async function generateTabInfo() {
  const randomId = `tab_${Math.random().toString(36).slice(2, 9)}`;
  return {
    tabId: randomId,
    tabName: `Document ${randomId.slice(-4)}`,
  };
}

// Create the relay instance
export const relay = new Relay({
  handlers: {
    ...worksheetHandlers,
    ...workbookHandlers,
  },
  getTabInfo: generateTabInfo,
});
```

### 3. Use with React

```tsx
// App.tsx

function App() {
  return (
    <RelayProvider relay={relay}>
      <Dashboard />
    </RelayProvider>
  );
}
```

```tsx
// Dashboard.tsx

function Dashboard() {
  const tabInfo = useTabInfo();
  const tabList = useTabList();
  const requestAction = useRequestAction();

  const getWorkbookInfo = async tabId => {
    try {
      const info = await requestAction<WorkbookInfo>(tabId, "GET_WORKBOOK_INFO");
      console.log("Workbook info:", info);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <h1>Current Tab: {tabInfo?.tabName}</h1>
      <h2>Connected Tabs:</h2>
      <ul>
        {tabList.map(tab => (
          <li key={tab.tabId}>
            {tab.tabName}
            {tab.tabId !== tabInfo?.tabId && <button onClick={() => getWorkbookInfo(tab.tabId)}>Get Info</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Framework Agnostic Usage

```typescript
import { Relay } from "@powertoys/relay";

const relay = new Relay({
  handlers: {
    PING: async () => "PONG",
  },
  getTabInfo: async () => ({ tabId: "unique-id", tabName: "My Document" }),
});

// Initialize
await relay.initialize();

// Subscribe to events
relay.onEvent({
  next: event => {
    if (event.type === "tabListUpdated") {
      console.log("Connected tabs:", event.tabs);
    }
  },
});

// Request an action from another tab
const targetTabId = "another-tab-id";
try {
  const result = await new Promise((resolve, reject) => {
    relay.requestAction(targetTabId, "SOME_ACTION", { data: "example" }, resolve, reject);
  });
  console.log("Result:", result);
} catch (error) {
  console.error("Error:", error);
}

// Clean up when done
relay.cleanup();
```

## API Reference

### Relay

The core class for managing tab-to-tab communication.

#### Constructor

```typescript
constructor(options: RelayOptions)
```

Options:

- `handlers` (Record<string, ActionHandler>): Map of action handlers
- `getTabInfo` (() => Promise<TabInfo>): Function to get tab info
- `heartbeatInterval` (number, optional): Interval for sending heartbeats (default: 10000ms)

#### Methods

- `initialize(): Promise<void>`: Initialize the communicator
- `getTabList(): void`: Request the current tab list
- `requestAction<TResult>(targetTabId: string, action: string, payload?: any, onSuccess?: (result: TResult) => void, onError?: (error: string) => void): string | null`: Request an action from another tab
- `cleanup(): void`: Clean up the communicator
- `onEvent(subscriber: Subscriber<TabCommunicatorEvent>): () => void`: Subscribe to all events
- `onTabListUpdated(subscriber: Subscriber<TabListItem[]>): () => void`: Subscribe to tab list updates
- `getTabInfo(): TabInfo | null`: Get the current tab info
- `isConnected(): boolean`: Check if the communicator is initialized

### React Hooks

- `useRelay()`: Access the Relay instance
- `useTabInfo()`: Get the current tab info
- `useTabList()`: Get the list of connected tabs
- `useRequestAction()`: Get a function to request actions from other tabs

## Advanced Features

### Custom Observables

The library includes a lightweight Observable implementation:

```typescript
import { Observable } from "@powertoys/relay";

const counter$ = new Observable<number>();

// Subscribe
const unsubscribe = counter$.subscribe({
  next: value => console.log("Count:", value),
  error: err => console.error("Error:", err),
  complete: () => console.log("Completed"),
});

// Emit values
counter$.next(1);
counter$.next(2);

// Unsubscribe
unsubscribe();
```

### Type-Safe Action Handlers

Define type-safe action handlers with proper payload and result types:

```typescript
import { ActionHandler } from "@powertoys/relay";

interface UserPayload {
  userId: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const getUserProfile: ActionHandler<UserPayload, UserProfile> = async payload => {
  const { userId } = payload;
  // Implementation...
  return {
    id: userId,
    name: "John Doe",
    email: "john@example.com",
  };
};
```

## Browser Support

This library uses SharedWorker which is supported in:

- Chrome 4+
- Firefox 29+
- Edge 79+
- Safari 10.1+
- Opera 10.6+

For browsers that don't support SharedWorker, you can implement a fallback using localStorage or BroadcastChannel.

## License

MIT
