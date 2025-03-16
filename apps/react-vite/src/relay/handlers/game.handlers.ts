const ping = async () => {
  console.log("ping");
  return "pong";
};

const reload = () => {
  window.location.reload();
};

const close = () => {
  window.close();
};

export const gameHandlers = {
  PING: ping,
  RELOAD: reload,
  CLOSE_WINDOW: close,
};
