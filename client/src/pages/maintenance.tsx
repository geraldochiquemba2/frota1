import { useState } from "react";
import { MaintenanceCard } from "@/components/fleet/MaintenanceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Calendar, Wrench } from "lucide-react";

// todo: remove mock functionality
const mockMaintenance = [
  { id: "m1", vehiclePlate: "ABC-1234", serviceType: "Oil Change", scheduledDate: "2024-12-20", status: "scheduled" as const, description: "Regular oil change and filter replacement" },
  { id: "m2", vehiclePlate: "XYZ-5678", serviceType: "Brake Inspection", scheduledDate: "2024-12-18", status: "in-progress" as const, description: "Full brake system inspection and pad replacement" },
  { id: "m3", vehiclePlate: "DEF-9012", serviceType: "Tire Rotation", scheduledDate: "2024-12-10", status: "overdue" as const, description: "Tire rotation and pressure check" },
  { id: "m4", vehiclePlate: "GHI-3456", serviceType: "Engine Tune-up", scheduledDate: "2024-12-01", status: "completed" as const, description: "Complete engine tune-up and diagnostics" },
  { id: "m5", vehiclePlate: "JKL-7890", serviceType: "Transmission Service", scheduledDate: "2024-12-22", status: "scheduled" as const, description: "Transmission fluid change" },
  { id: "m6", vehiclePlate: "MNO-2345", serviceType: "Air Filter Replacement", scheduledDate: "2024-12-25", status: "scheduled" as const, description: "Replace cabin and engine air filters" },
];

const serviceTypes = [
  "Oil Change",
  "Brake Inspection",
  "Tire Rotation",
  "Engine Tune-up",
  "Transmission Service",
  "Air Filter Replacement",
  "Battery Check",
  "Coolant Flush",
  "General Inspection",
];

export default function Maintenance() {
  const [maintenance, setMaintenance] = useState(mockMaintenance);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "in-progress" | "completed" | "overdue">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    vehiclePlate: "",
    serviceType: "",
    scheduledDate: "",
    description: "",
  });

  const filteredMaintenance = maintenance.filter(m => {
    const matchesSearch = m.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      m.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddMaintenance = () => {
    const id = `m${Date.now()}`;
    setMaintenance([...maintenance, {
      ...newMaintenance,
      id,
      status: "scheduled" as const,
    }]);
    setNewMaintenance({ vehiclePlate: "", serviceType: "", scheduledDate: "", description: "" });
    setIsAddDialogOpen(false);
    console.log("Maintenance scheduled:", newMaintenance);
  };

  const handleComplete = (id: string) => {
    setMaintenance(maintenance.map(m =>
      m.id === id ? { ...m, status: "completed" as const } : m
    ));
    console.log("Maintenance completed:", id);
  };

  const statusCounts = {
    all: maintenance.length,
    scheduled: maintenance.filter(m => m.status === "scheduled").length,
    "in-progress": maintenance.filter(m => m.status === "in-progress").length,
    overdue: maintenance.filter(m => m.status === "overdue").length,
    completed: maintenance.filter(m => m.status === "completed").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Maintenance</h1>
          <p className="text-muted-foreground">Schedule and track vehicle maintenance</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-maintenance">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Maintenance</DialogTitle>
              <DialogDescription>
                Schedule a maintenance service for a vehicle.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
                <Input
                  id="vehiclePlate"
                  placeholder="ABC-1234"
                  value={newMaintenance.vehiclePlate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, vehiclePlate: e.target.value })}
                  data-testid="input-maintenance-plate"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={newMaintenance.serviceType}
                  onValueChange={(v) => setNewMaintenance({ ...newMaintenance, serviceType: v })}
                >
                  <SelectTrigger data-testid="select-service-type">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={newMaintenance.scheduledDate}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                  data-testid="input-maintenance-date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details..."
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                  data-testid="input-maintenance-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddMaintenance} data-testid="button-confirm-schedule">Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search maintenance..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-maintenance"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "scheduled", "in-progress", "overdue", "completed"] as const).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            {" "}({statusCounts[status]})
          </Button>
        ))}
      </div>

      {filteredMaintenance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenance.map(item => (
            <MaintenanceCard
              key={item.id}
              {...item}
              onComplete={() => handleComplete(item.id)}
              onReschedule={() => console.log("Reschedule", item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No maintenance records found.</p>
        </div>
      )}
    </div>
  );
}
