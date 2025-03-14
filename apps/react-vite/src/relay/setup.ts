import { Relay } from "@powertoys/relay";
import { gameHandlers } from "./handlers/game.handlers";

async function generateTabInfo() {
  const randomId = `tab_${Math.random().toString(36).slice(2, 9)}`;
  return {
    tabId: randomId,
    tabName: `Document ${randomId.slice(-4)}`,
  };
}

export const relay = new Relay({
  handlers: {
    ...gameHandlers,
  },
  getTabInfo: generateTabInfo,
});
