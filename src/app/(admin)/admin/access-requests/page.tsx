import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { UserPlus, Clock, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AccessRequestActions } from "@/components/admin/access-request-actions";

export default async function AdminAccessRequestsPage() {
  await requireAdmin();

  const requests = await prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter((r) => r.status === "PENDING").length;
  const approved = requests.filter((r) => r.status === "APPROVED").length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Access Requests</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="size-4" />
            Total Requests
          </div>
          <p className="mt-2 text-2xl font-bold">{requests.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            Pending
          </div>
          <p className="mt-2 text-2xl font-bold">{pending}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4" />
            Approved
          </div>
          <p className="mt-2 text-2xl font-bold">{approved}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((req) => (
              <TableRow key={req.id}>
                <TableCell className="font-medium">{req.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {req.email}
                </TableCell>
                <TableCell>
                  <a
                    href={req.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Profile
                  </a>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      req.status === "PENDING"
                        ? "text-amber-500 text-xs font-medium"
                        : req.status === "APPROVED"
                          ? "text-green-500 text-xs font-medium"
                          : "text-red-500 text-xs font-medium"
                    }
                  >
                    {req.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(req.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  {req.status === "PENDING" && (
                    <AccessRequestActions id={req.id} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {requests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  No access requests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
