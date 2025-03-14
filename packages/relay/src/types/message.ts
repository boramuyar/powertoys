export interface TabInfo {
  tabId: string;
  tabName: string;
}

export interface TabListItem extends TabInfo {
  lastSeen: number;
}

// Base message interface
export interface Message {
  type: string;
}

// Messages sent to the worker
export interface RegisterMessage extends Message {
  type: "REGISTER";
  tabId: string;
  tabName: string;
}

export interface HeartbeatMessage extends Message {
  type: "HEARTBEAT";
  tabId: string;
}

export interface GetTabListMessage extends Message {
  type: "GET_TAB_LIST";
}

export interface RequestActionMessage extends Message {
  type: "REQUEST_ACTION";
  targetTabId: string;
  action: string;
  requestId: string;
  payload?: any;
}

export interface ActionResponseMessage extends Message {
  type: "ACTION_RESPONSE";
  requestId: string;
  requestorId: string;
  result: any;
}

export interface UnregisterMessage extends Message {
  type: "UNREGISTER";
  tabId: string;
}

export type OutgoingWorkerMessage =
  | RegisterMessage
  | HeartbeatMessage
  | GetTabListMessage
  | RequestActionMessage
  | ActionResponseMessage
  | UnregisterMessage;

// Messages received from the worker
export interface TabListMessage extends Message {
  type: "TAB_LIST";
  tabs: TabListItem[];
}

export interface ActionResultMessage extends Message {
  type: "ACTION_RESULT";
  requestId: string;
  result: any;
}

export interface ActionErrorMessage extends Message {
  type: "ACTION_ERROR";
  requestId: string;
  error: string;
}

export interface ActionRequestMessage extends Message {
  type: "ACTION_REQUEST";
  action: string;
  requestId: string;
  requestorId: string;
  payload?: any;
}

export interface RegistrationMessage extends Message {
  type: "REGISTRATION";
  tabId: string;
  tabName: string;
}

export type IncomingWorkerMessage =
  | TabListMessage
  | ActionResultMessage
  | ActionErrorMessage
  | ActionRequestMessage
  | RegistrationMessage;

// Pending request interface
export interface PendingRequest {
  targetTabId: string;
  action: string;
  payload?: any;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}
