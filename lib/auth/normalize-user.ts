import type { AuthUser } from "@/types/auth";

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function identifier(value: unknown): string {
  const object = record(value);
  return text(value) || text(object?._id) || text(object?.id);
}

/** Convert API user documents and response envelopes to the session model. */
export function normalizeAuthUser(payload: unknown): AuthUser {
  let user = record(payload);
  for (let depth = 0; user && depth < 4; depth++) {
    const userId = text(user.userId) || text(user._id) || text(user.id) || text(user.sub);
    const role = text(user.role);
    const email = text(user.email);
    if (userId && role && email) {
      const firstName = text(user.firstName);
      const lastName = text(user.lastName);
      return {
        userId,
        role: role.toUpperCase(),
        email,
        firstName,
        lastName,
        fullName: text(user.fullName) || [firstName, lastName].filter(Boolean).join(" "),
        phoneNumber: text(user.phoneNumber) || undefined,
        tenantId: identifier(user.tenantId) || identifier(user.tenant) || undefined,
      };
    }
    user = record(user.user) ?? record(user.data);
  }
  throw new Error("The authentication service returned an invalid user.");
}
