import { Badge } from "@/components/ui/badge";
import { Circle, Pause, Wrench, AlertTriangle } from "lucide-react";

export type VehicleStatus = "active" | "idle" | "maintenance" | "alert";

interface StatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

const statusConfig = {
  active: {
    label: "Ativo",
    icon: Circle,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  idle: {
    label: "Parado",
    icon: Pause,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  maintenance: {
    label: "Manutenção",
    icon: Wrench,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  alert: {
    label: "Alerta",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${className} gap-1.5 no-default-hover-elevate no-default-active-elevate`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
