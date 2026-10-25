import axios, { type AxiosInstance } from "axios";
import { SessionChangedError, SessionExpiredError } from "./session-controller.ts";

declare module "axios" {
  interface AxiosRequestConfig {
    silent?: boolean;
    skipAuthRefresh?: boolean;
    _authVersion?: number;
    _authToken?: string | null;
    _retry?: boolean;
  }
}

interface Dependencies {
  snapshot: () => { token: string | null; sessionVersion: number; isLoggingOut: boolean };
  refresh: () => Promise<string>;
  expire: () => void;
  notify: (error: unknown, refreshFailure?: boolean) => void;
}

export function attachRequestAuth(client: AxiosInstance, deps: Dependencies) {
  client.interceptors.request.use((config) => {
    const state = deps.snapshot();
    config._authVersion ??= state.sessionVersion;
    if (state.isLoggingOut || config._authVersion !== state.sessionVersion) throw new axios.CanceledError("The session changed.");
    config._authToken = state.token;
    if (state.token) config.headers.set("Authorization", `Bearer ${state.token}`);
    else config.headers.delete("Authorization");
    return config;
  });
  client.interceptors.response.use((response) => {
    if (response.config._authVersion !== deps.snapshot().sessionVersion) throw new axios.CanceledError("The session changed.");
    return response;
  }, async (error: unknown) => {
    if (axios.isCancel(error)) throw error;
    const config = axios.isAxiosError(error) ? error.config : undefined;
    const state = deps.snapshot();
    if (state.isLoggingOut || (config?._authVersion !== undefined && config._authVersion !== state.sessionVersion)) throw new axios.CanceledError("The session changed.");
    if (axios.isAxiosError(error) && error.response?.status === 401 && config && !config.skipAuthRefresh) {
      if (config._retry) {
        deps.expire();
        throw new axios.CanceledError("The session ended.");
      }
      config._retry = true;
      try {
        // A late 401 from an old token can reuse a refresh that already finished.
        if (!state.token || state.token === config._authToken) await deps.refresh();
      } catch (refreshError) {
        if (refreshError instanceof SessionChangedError || refreshError instanceof SessionExpiredError || axios.isCancel(refreshError)) throw new axios.CanceledError("The session ended.");
        if (!config.silent) deps.notify(refreshError, true);
        throw refreshError;
      }
      if (config._authVersion !== deps.snapshot().sessionVersion) throw new axios.CanceledError("The session changed.");
      return client(config);
    }
    if (!config?.silent) deps.notify(error);
    throw error;
  });
}
