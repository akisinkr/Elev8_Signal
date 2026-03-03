import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { NewSignalFormWrapper } from "./new-signal-form-wrapper";

export default function AdminNewSignalPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Signal Question"
        description="Draft a new Signal question for the community."
      />

      <Card>
        <CardContent>
          <NewSignalFormWrapper />
        </CardContent>
      </Card>
    </div>
  );
}
