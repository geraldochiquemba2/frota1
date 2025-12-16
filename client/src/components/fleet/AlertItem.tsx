import { AlertTriangle, Clock, FileWarning, Fuel, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AlertType = "maintenance" | "document" | "fuel" | "speed";

interface AlertItemProps {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  onDismiss?: () => void;
  onClick?: () => void;
}

const alertIcons = {
  maintenance: Fuel,
  document: FileWarning,
  fuel: Fuel,
  speed: AlertTriangle,
};

const alertColors = {
  maintenance: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
  document: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
  fuel: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  speed: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30",
};

export function AlertItem({ id, type, title, description, timestamp, onDismiss, onClick }: AlertItemProps) {
  const Icon = alertIcons[type];

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-md hover-elevate cursor-pointer bg-card"
      onClick={onClick}
      data-testid={`alert-item-${id}`}
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${alertColors[type]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timestamp}</span>
        </div>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          data-testid={`button-dismiss-alert-${id}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
