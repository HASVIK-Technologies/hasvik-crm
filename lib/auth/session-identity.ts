interface Identity { userId: string; role: string; tenantId?: string }

export function sameSessionIdentity(previous: Identity, next: Identity): boolean {
  return previous.userId === next.userId && previous.tenantId === next.tenantId && previous.role.trim().toUpperCase() === next.role.trim().toUpperCase();
}
