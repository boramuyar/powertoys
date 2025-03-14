import { TabInfo, TabListItem } from "./message";

export interface ConnectedEvent {
  type: "connected";
  tabInfo: TabInfo;
}

export interface DisconnectedEvent {
  type: "disconnected";
}

export interface TabListUpdatedEvent {
  type: "tabListUpdated";
  tabs: TabListItem[];
}

export interface TabRegisteredEvent {
  type: "tabRegistered";
  tabId: string;
  tabName: string;
}

export interface ActionResultEvent {
  type: "actionResult";
  requestId: string;
  result: any;
}

export type TabCommunicatorEvent =
  | ConnectedEvent
  | DisconnectedEvent
  | TabListUpdatedEvent
  | TabRegisteredEvent
  | ActionResultEvent;
