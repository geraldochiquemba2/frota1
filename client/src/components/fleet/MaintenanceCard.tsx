import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Calendar, CheckCircle } from "lucide-react";

interface MaintenanceCardProps {
  id: string;
  vehiclePlate: string;
  serviceType: string;
  scheduledDate: string;
  status: "scheduled" | "in-progress" | "completed" | "overdue";
  description?: string;
  onComplete?: () => void;
  onReschedule?: () => void;
}

const statusConfig = {
  scheduled: { label: "Agendada", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  "in-progress": { label: "Em Andamento", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  completed: { label: "Concluída", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  overdue: { label: "Atrasada", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export function MaintenanceCard({
  id,
  vehiclePlate,
  serviceType,
  scheduledDate,
  status,
  description,
  onComplete,
  onReschedule,
}: MaintenanceCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-maintenance-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-base">{serviceType}</CardTitle>
            <p className="font-mono text-sm text-muted-foreground">{vehiclePlate}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${statusConfig[status].className} no-default-hover-elevate no-default-active-elevate`}
        >
          {statusConfig[status].label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(scheduledDate).toLocaleDateString('pt-BR')}</span>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {status !== "completed" && (
          <div className="flex gap-2 pt-2">
            {status === "scheduled" && (
              <Button size="sm" variant="outline" onClick={onReschedule} data-testid={`button-reschedule-${id}`}>
                Reagendar
              </Button>
            )}
            <Button size="sm" onClick={onComplete} data-testid={`button-complete-${id}`}>
              <CheckCircle className="h-4 w-4 mr-1.5" />
              Marcar Concluída
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
