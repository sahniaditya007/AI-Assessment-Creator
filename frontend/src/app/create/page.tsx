import { AppShell } from "@/components/layout/AppShell";
import { AssignmentForm } from "@/components/form/AssignmentForm";

export default function CreateAssignmentPage() {
  return (
    <AppShell
      title="Create Assignment"
      subtitle="Set up a new assignment for your students"
      showBack
      breadcrumb="Create New"
    >
      <AssignmentForm />
    </AppShell>
  );
}
