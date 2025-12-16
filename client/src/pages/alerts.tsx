import { useState } from "react";
import { AlertItem, type AlertType } from "@/components/fleet/AlertItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Bell, CheckCheck } from "lucide-react";

// todo: remove mock functionality
const mockAlerts = [
  { id: "a1", type: "fuel" as AlertType, title: "Low Fuel Warning", description: "Vehicle GHI-3456 fuel level below 15%", timestamp: "10 minutes ago" },
  { id: "a2", type: "document" as AlertType, title: "License Expiring", description: "Driver Maria Santos license expires in 15 days", timestamp: "1 hour ago" },
  { id: "a3", type: "maintenance" as AlertType, title: "Maintenance Overdue", description: "Vehicle ABC-1234 is overdue for oil change by 500km", timestamp: "2 hours ago" },
  { id: "a4", type: "speed" as AlertType, title: "Speed Violation", description: "Vehicle XYZ-5678 exceeded speed limit on BR-116", timestamp: "3 hours ago" },
  { id: "a5", type: "document" as AlertType, title: "Insurance Expiring", description: "Vehicle DEF-9012 insurance expires in 7 days", timestamp: "5 hours ago" },
  { id: "a6", type: "maintenance" as AlertType, title: "Tire Pressure Low", description: "Vehicle JKL-7890 rear left tire pressure is low", timestamp: "6 hours ago" },
  { id: "a7", type: "fuel" as AlertType, title: "Unusual Fuel Consumption", description: "Vehicle MNO-2345 showing 30% higher fuel consumption than average", timestamp: "1 day ago" },
  { id: "a8", type: "speed" as AlertType, title: "Hard Braking Detected", description: "Vehicle ABC-1234 had 3 hard braking events today", timestamp: "1 day ago" },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AlertType | "all">("all");

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDismiss = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    console.log("Alert dismissed:", id);
  };

  const handleDismissAll = () => {
    setAlerts([]);
    console.log("All alerts dismissed");
  };

  const typeCounts = {
    all: alerts.length,
    maintenance: alerts.filter(a => a.type === "maintenance").length,
    document: alerts.filter(a => a.type === "document").length,
    fuel: alerts.filter(a => a.type === "fuel").length,
    speed: alerts.filter(a => a.type === "speed").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Alerts</h1>
          <p className="text-muted-foreground">Monitor and manage fleet alerts</p>
        </div>
        {alerts.length > 0 && (
          <Button variant="outline" onClick={handleDismissAll} data-testid="button-dismiss-all">
            <CheckCheck className="h-4 w-4 mr-2" />
            Dismiss All
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-alerts"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("all")}
        >
          All ({typeCounts.all})
        </Button>
        <Button
          variant={typeFilter === "maintenance" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("maintenance")}
        >
          Maintenance ({typeCounts.maintenance})
        </Button>
        <Button
          variant={typeFilter === "document" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("document")}
        >
          Documents ({typeCounts.document})
        </Button>
        <Button
          variant={typeFilter === "fuel" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("fuel")}
        >
          Fuel ({typeCounts.fuel})
        </Button>
        <Button
          variant={typeFilter === "speed" ? "default" : "outline"}
          size="sm"
          onClick={() => setTypeFilter("speed")}
        >
          Speed ({typeCounts.speed})
        </Button>
      </div>

      {filteredAlerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Active Alerts ({filteredAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredAlerts.map(alert => (
              <AlertItem
                key={alert.id}
                {...alert}
                onDismiss={() => handleDismiss(alert.id)}
                onClick={() => console.log("Alert clicked:", alert.id)}
              />
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {alerts.length === 0 ? "No active alerts. Your fleet is running smoothly!" : "No alerts match your search."}
          </p>
        </div>
      )}
    </div>
  );
}
