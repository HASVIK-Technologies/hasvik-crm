import axios from "axios";

type ApiErrorPayload = {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
};

const statusMessages: Record<number, string> = {
  400: "The request was invalid.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  408: "The request timed out. Please try again.",
  409: "This action conflicts with existing data.",
  422: "Some of the submitted data is invalid.",
  429: "Too many requests. Please try again shortly.",
};

function getPayloadMessage(payload: ApiErrorPayload): string | undefined {
  for (const value of [payload.message, payload.error]) {
    if (typeof value === "string" && value.trim()) return value;
  }

  if (Array.isArray(payload.errors)) {
    const messages = payload.errors.filter(
      (value): value is string => typeof value === "string" && Boolean(value.trim()),
    );
    if (messages.length > 0) return messages.join(" ");
  }

  if (payload.errors && typeof payload.errors === "object") {
    const messages = Object.values(payload.errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter(
        (value): value is string => typeof value === "string" && Boolean(value.trim()),
      );
    if (messages.length > 0) return messages.join(" ");
  }

  return undefined;
}

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }

  if (!error.response) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return "The request timed out. Please try again.";
    }
    return "Unable to reach the server. Check your connection and try again.";
  }

  const payload = error.response.data as unknown;
  if (typeof payload === "string" && payload.trim()) return payload;
  if (payload && typeof payload === "object") {
    const message = getPayloadMessage(payload as ApiErrorPayload);
    if (message) return message;
  }

  return (
    statusMessages[error.response.status] ??
    (error.response.status >= 500
      ? "The server is unavailable right now. Please try again."
      : `Request failed with status ${error.response.status}.`)
  );
}