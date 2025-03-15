import { Relay } from "@powertoys/relay";
import { gameHandlers } from "./handlers/game.handlers";

export const relay = new Relay({
  handlers: {
    ...gameHandlers,
  },
});
