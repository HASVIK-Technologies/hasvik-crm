import { SessionChangedError } from "./session-controller.ts";

export async function restoreSession<User>(deps: {
  snapshot: () => { token: string | null; sessionVersion: number };
  refresh: () => Promise<string>;
  getUser: (signal?: AbortSignal) => Promise<User>;
  commit: (token: string, user: User) => void;
  signal?: AbortSignal;
}) {
  const { token: initialToken, sessionVersion: version } = deps.snapshot();
  const accessToken = initialToken ?? await deps.refresh();
  if (deps.signal?.aborted || version !== deps.snapshot().sessionVersion) throw new SessionChangedError();
  const user = await deps.getUser(deps.signal);
  const current = deps.snapshot();
  if (deps.signal?.aborted || version !== current.sessionVersion) throw new SessionChangedError();
  const token = current.token ?? accessToken;
  deps.commit(token, user);
  return { accessToken: token, user };
}
