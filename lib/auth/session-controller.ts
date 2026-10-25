export class SessionChangedError extends Error {
  constructor() { super("The authentication session changed."); this.name = "SessionChangedError"; }
}

export class SessionExpiredError extends Error {
  constructor() { super("Please sign in to continue."); this.name = "SessionExpiredError"; }
}

interface Dependencies {
  version: () => number;
  blocked: () => boolean;
  request: (signal: AbortSignal) => Promise<string>;
  apply: (token: string) => void;
  expire: () => void;
  isUnauthorized: (error: unknown) => boolean;
}

export function createSessionController(deps: Dependencies) {
  let flight: { version: number; controller: AbortController; promise: Promise<string> } | undefined;
  return {
    refresh(): Promise<string> {
      const version = deps.version();
      if (deps.blocked()) return Promise.reject(new SessionChangedError());
      if (flight?.version === version) return flight.promise;
      flight?.controller.abort();
      const controller = new AbortController();
      const promise = Promise.resolve().then(() => deps.request(controller.signal)).then((token) => {
        if (controller.signal.aborted || deps.version() !== version || deps.blocked()) throw new SessionChangedError();
        if (!token.trim()) throw new Error("The authentication service returned an empty token.");
        deps.apply(token);
        return token;
      }).catch((error: unknown) => {
        if (controller.signal.aborted || deps.version() !== version || deps.blocked()) throw new SessionChangedError();
        if (deps.isUnauthorized(error)) {
          deps.expire();
          throw new SessionExpiredError();
        }
        // Offline, timeout, rate-limit, and server failures do not end a session.
        throw error;
      }).finally(() => {
        if (flight?.promise === promise) flight = undefined;
      });
      flight = { version, controller, promise };
      return promise;
    },
    cancel() { flight?.controller.abort(); flight = undefined; },
  };
}
