const ping = async () => {
  console.log("ping");
  return "pong";
};

export const gameHandlers = {
  PING: ping,
};
