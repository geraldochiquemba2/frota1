import { StatusBadge } from "../fleet/StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-4">
      <StatusBadge status="active" />
      <StatusBadge status="idle" />
      <StatusBadge status="maintenance" />
      <StatusBadge status="alert" />
    </div>
  );
}
