import { cn } from "@/lib/utils";

const statusClass: Record<string, string> = {
  Submitted: "bg-muted text-muted-foreground border-border",
  "Under Review": "bg-info/10 text-info border-info/30",
  "In Progress": "bg-warning/15 text-warning-foreground border-warning/40",
  Resolved: "bg-success/10 text-success border-success/30",
  Closed: "bg-primary/10 text-primary border-primary/25",
};

const priorityClass: Record<string, string> = {
  Low: "bg-muted text-muted-foreground border-border",
  Medium: "bg-info/10 text-info border-info/30",
  High: "bg-warning/15 text-warning-foreground border-warning/40",
  Critical: "bg-destructive/10 text-destructive border-destructive/30",
};

function Pill({ label, className }: { label: string; className?: string | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return <Pill label={status} className={statusClass[status] ?? statusClass["Submitted"]} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <Pill label={priority} className={priorityClass[priority] ?? priorityClass["Low"]} />;
}
