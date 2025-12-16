import { AlertItem } from "../fleet/AlertItem";

export default function AlertItemExample() {
  return (
    <div className="space-y-2 max-w-md">
      <AlertItem
        id="a1"
        type="maintenance"
        title="Maintenance Overdue"
        description="Vehicle ABC-1234 is overdue for oil change by 500km"
        timestamp="2 hours ago"
        onDismiss={() => console.log("Dismissed")}
        onClick={() => console.log("Alert clicked")}
      />
      <AlertItem
        id="a2"
        type="document"
        title="License Expiring"
        description="Driver Maria Santos license expires in 15 days"
        timestamp="1 day ago"
        onDismiss={() => console.log("Dismissed")}
        onClick={() => console.log("Alert clicked")}
      />
      <AlertItem
        id="a3"
        type="fuel"
        title="Low Fuel Warning"
        description="Vehicle XYZ-5678 fuel level below 15%"
        timestamp="30 minutes ago"
        onDismiss={() => console.log("Dismissed")}
        onClick={() => console.log("Alert clicked")}
      />
      <AlertItem
        id="a4"
        type="speed"
        title="Speed Violation"
        description="Vehicle DEF-9012 exceeded speed limit on BR-116"
        timestamp="5 minutes ago"
        onDismiss={() => console.log("Dismissed")}
        onClick={() => console.log("Alert clicked")}
      />
    </div>
  );
}
