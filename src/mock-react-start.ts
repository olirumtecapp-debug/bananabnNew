export function createServerFn(options?: any) {
  const fn: any = (args?: any) => {
    return Promise.reject(new Error("Multiplayer functions are unavailable in client-only mode."));
  };
  fn.inputValidator = () => fn;
  fn.handler = () => fn;
  fn.validator = () => fn;
  fn.middleware = () => fn;
  return fn;
}

export function json(data: any) {
  return data;
}
