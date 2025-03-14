# @powertoys/relay-react

React bindings for [@powertoys/relay](https://github.com/microsoft/PowerToys/tree/main/packages/relay).

## Installation

```bash
npm install @powertoys/relay @powertoys/relay-react
# or
yarn add @powertoys/relay @powertoys/relay-react
# or
pnpm add @powertoys/relay @powertoys/relay-react
```

## Usage

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
// setup.ts
import { Relay } from "@powertoys/relay";
import { worksheetHandlers } from "./handlers/worksheet-handlers";
import { workbookHandlers } from "./handlers/workbook-handlers";

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
import React from "react";
import { RelayProvider } from "@powertoys/relay";
import { relay } from "./setup";
import Dashboard from "./Dashboard";

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
import React from "react";
import { useTabInfo, useTabList, useRequestAction } from "@powertoys/relay";
import { WorkbookInfo } from "./handlers/workbook-handlers";

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

## API

### `RelayProvider`

Provider component that makes the relay instance available to all child components.

```tsx
<RelayProvider relay={relay}>{children}</RelayProvider>
```

### `useRelay`

Hook to access the relay instance.

```tsx
const relay = useRelay();
```

### `useTabInfo`

Hook to get information about the current tab.

```tsx
const tabInfo = useTabInfo();
```

### `useTabList`

Hook to get a list of all tabs.

```tsx
const tabList = useTabList();
```

### `useRequestAction`

Hook to request an action from another tab.

```tsx
const requestAction = useRequestAction();

// Usage
requestAction(
  targetTabId,
  "actionName",
  payload,
  result => {
    // Handle success
  },
  error => {
    // Handle error
  }
);

// Or with promises
requestAction(targetTabId, "actionName", payload)
  .then(result => {
    // Handle success
  })
  .catch(error => {
    // Handle error
  });
```

## License

MIT
