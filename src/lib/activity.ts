import { prisma } from "./db";

export function logActivity(userId: string | null, action: string, entity: string, entityId?: string | null, detail = "") {
  return prisma.activityLog.create({ data: { userId, action, entity, entityId: entityId ?? null, detail } });
}
