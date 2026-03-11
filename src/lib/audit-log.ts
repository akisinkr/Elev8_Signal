import { prisma } from "@/lib/db";

interface LogActionParams {
  admin: { id: string; email: string };
  action: string;
  targetId?: string;
  targetLabel?: string;
  detail?: Record<string, unknown>;
}

/**
 * Write an admin action to the audit log.
 * Never throws — logging failure must not break the main action.
 */
export async function logAdminAction({
  admin,
  action,
  targetId,
  targetLabel,
  detail,
}: LogActionParams) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: admin.id,
        adminEmail: admin.email,
        action,
        targetId: targetId ?? null,
        targetLabel: targetLabel ?? null,
        detail: detail ? JSON.stringify(detail) : null,
      },
    });
  } catch {
    // Silent — never fail the parent action
  }
}

// ── Action constants ──────────────────────────────────────────────

export const AUDIT = {
  ACCESS_REQUEST_APPROVED: "ACCESS_REQUEST_APPROVED",
  ACCESS_REQUEST_REJECTED: "ACCESS_REQUEST_REJECTED",
  SIGNAL_CREATED:          "SIGNAL_CREATED",
  SIGNAL_PUBLISHED:        "SIGNAL_PUBLISHED",   // DRAFT → LIVE
  SIGNAL_CLOSED:           "SIGNAL_CLOSED",       // LIVE → CLOSED
  SIGNAL_RESULTS_SENT:     "SIGNAL_RESULTS_SENT", // CLOSED → PUBLISHED
  SIGNAL_DELETED:          "SIGNAL_DELETED",
} as const;
