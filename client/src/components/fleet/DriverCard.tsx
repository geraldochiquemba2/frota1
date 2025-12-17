import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, FileText, Clock } from "lucide-react";

interface DriverCardProps {
  id: string;
  name: string;
  photo?: string | null;
  phone: string;
  email: string;
  licenseExpiry: string;
  status: string;
  assignedVehicle?: string;
  onClick?: () => void;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  "available": { label: "Disponível", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  "on-trip": { label: "Em Viagem", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  "on_trip": { label: "Em Viagem", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  "off-duty": { label: "Folga", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
};

const getStatusInfo = (status: string) => {
  return statusLabels[status] || { label: status || "Desconhecido", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" };
};

export function DriverCard({
  id,
  name,
  photo,
  phone,
  email,
  licenseExpiry,
  status,
  assignedVehicle,
  onClick,
}: DriverCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const hasValidLicenseExpiry = licenseExpiry && licenseExpiry !== "" && new Date(licenseExpiry).getFullYear() > 1970;
  const isLicenseExpiringSoon = hasValidLicenseExpiry && new Date(licenseExpiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <Card
      className="hover-elevate cursor-pointer"
      onClick={onClick}
      data-testid={`card-driver-${id}`}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={photo || undefined} alt={name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="font-semibold truncate">{name}</h3>
            <Badge
              variant="outline"
              className={`${getStatusInfo(status).className} no-default-hover-elevate no-default-active-elevate`}
            >
              {getStatusInfo(status).label}
            </Badge>
          </div>
          {assignedVehicle && (
            <p className="text-sm text-muted-foreground">Veículo: {assignedVehicle}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span className="truncate">{email}</span>
        </div>
        {hasValidLicenseExpiry && (
          <div className={`flex items-center gap-2 text-sm ${isLicenseExpiringSoon ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}>
            <FileText className="h-3.5 w-3.5" />
            <span>Carta expira: {new Date(licenseExpiry).toLocaleDateString('pt-BR')}</span>
            {isLicenseExpiringSoon && <Clock className="h-3.5 w-3.5" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
