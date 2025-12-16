import { MetricCard } from "../fleet/MetricCard";
import { Truck, Users, AlertTriangle, Wrench } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Vehicles"
        value={48}
        icon={Truck}
        trend={{ value: 12, isPositive: true }}
        onClick={() => console.log("Vehicles clicked")}
      />
      <MetricCard
        title="Active Drivers"
        value={32}
        icon={Users}
        trend={{ value: 5, isPositive: true }}
      />
      <MetricCard
        title="Active Alerts"
        value={7}
        icon={AlertTriangle}
        trend={{ value: 15, isPositive: false }}
      />
      <MetricCard
        title="Maintenance Due"
        value={4}
        icon={Wrench}
      />
    </div>
  );
}
