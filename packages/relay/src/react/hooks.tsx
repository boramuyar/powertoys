import React, { useState, useEffect, useCallback, useContext, createContext, useRef } from "react";
import { Relay } from "../core/relay";
import { TabInfo, TabListItem } from "src/types";

// Context for the tab communicator
const RelayContext = createContext<Relay | null>(null);

// Provider props
interface RelayProviderProps {
  relay: Relay;
  children: React.ReactNode;
}

// Provider component
export function RelayProvider({ relay, children }: RelayProviderProps) {
  const hasInit = useRef(false);
  // Initialize on mount
  useEffect(() => {
    if (!hasInit.current) {
      relay.initialize().catch(console.error);
      hasInit.current = true;
    }

    // Cleanup on unmount
    return () => {
      if (process.env.NODE_ENV === "production" || !hasInit.current) relay.cleanup();
    };
  }, [relay]);

  return <RelayContext.Provider value={relay}>{children}</RelayContext.Provider>;
}

// Hook to use the tab communicator
export function useRelay() {
  const relay = useContext(RelayContext);

  if (!relay) throw new Error("useRelay must be used within a RelayProvider");

  return relay;
}

// Hook to get tab info
export function useTabInfo() {
  const relay = useRelay();
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(relay.getTabInfo());

  useEffect(() => {
    const unsubscribe = relay.onEvent({
      next: event => {
        if (event.type === "connected") {
          setTabInfo(event.tabInfo);
        } else if (event.type === "disconnected") {
          setTabInfo(null);
        }
      },
    });

    return unsubscribe;
  }, [relay]);

  return tabInfo;
}

// Hook to get tab list
export function useTabList() {
  const relay = useRelay();
  const [tabList, setTabList] = useState<TabListItem[]>([]);

  useEffect(() => {
    const unsubscribe = relay.onTabListUpdated({
      next: tabs => {
        setTabList(tabs);
      },
    });

    // Get initial tab list
    relay.getTabList();

    return unsubscribe;
  }, [relay]);

  return tabList;
}

// Hook to request an action
export function useRequestAction() {
  const relay = useRelay();

  const requestAction = useCallback(
    <TResult = any,>(
      targetTabId: string,
      action: string,
      payload?: any,
      onSuccess?: (result: TResult) => void,
      onError?: (error: string) => void
    ): Promise<TResult> => {
      return new Promise<TResult>((resolve, reject) => {
        relay.requestAction<TResult>(
          targetTabId,
          action,
          payload,
          result => {
            if (onSuccess) onSuccess(result);
            resolve(result);
          },
          error => {
            if (onError) onError(error);
            reject(new Error(error));
          }
        );
      });
    },
    [relay]
  );

  return requestAction;
}
