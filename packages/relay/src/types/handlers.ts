export type ActionHandler<TPayload = any, TResult = any> = (
  payload: TPayload,
  requestId: string,
  requestorId: string
) => Promise<TResult>;

export type ActionHandlerMap = Record<string, ActionHandler>;
