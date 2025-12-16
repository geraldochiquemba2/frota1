import { useState } from "react";
import { TripLogCard } from "@/components/fleet/TripLogCard";
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
import { Plus, Search, ClipboardList } from "lucide-react";

// todo: remove mock functionality
const mockTrips = [
  { id: "t1", vehiclePlate: "ABC-1234", driverName: "John Smith", startLocation: "Warehouse Central, SP", endLocation: "", startTime: "2024-12-16T08:30:00", purpose: "Delivery" },
  { id: "t2", vehiclePlate: "XYZ-5678", driverName: "Maria Santos", startLocation: "Office HQ, SP", endLocation: "Client Site, Campinas", startTime: "2024-12-16T07:00:00", endTime: "2024-12-16T09:45:00", distance: 85, purpose: "Client Meeting" },
  { id: "t3", vehiclePlate: "DEF-9012", driverName: "Carlos Oliveira", startLocation: "Distribution Center", endLocation: "Store #15, Guarulhos", startTime: "2024-12-16T06:00:00", endTime: "2024-12-16T08:30:00", distance: 42, purpose: "Stock Replenishment" },
  { id: "t4", vehiclePlate: "GHI-3456", driverName: "Ana Silva", startLocation: "Main Office", endLocation: "Airport, GRU", startTime: "2024-12-15T14:00:00", endTime: "2024-12-15T15:30:00", distance: 28, purpose: "Airport Transfer" },
  { id: "t5", vehiclePlate: "JKL-7890", driverName: "Pedro Costa", startLocation: "Factory A", endLocation: "Factory B", startTime: "2024-12-15T10:00:00", endTime: "2024-12-15T11:15:00", distance: 35, purpose: "Parts Transfer" },
];

const purposes = [
  "Delivery",
  "Client Meeting",
  "Stock Replenishment",
  "Airport Transfer",
  "Parts Transfer",
  "Service Call",
  "Personal",
  "Other",
];

export default function Trips() {
  const [trips, setTrips] = useState(mockTrips);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ongoing" | "completed">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    vehiclePlate: "",
    driverName: "",
    startLocation: "",
    purpose: "",
  });

  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(search.toLowerCase());
    const isOngoing = !t.endTime;
    const matchesFilter = filter === "all" ||
      (filter === "ongoing" && isOngoing) ||
      (filter === "completed" && !isOngoing);
    return matchesSearch && matchesFilter;
  });

  const handleStartTrip = () => {
    const id = `t${Date.now()}`;
    setTrips([{
      ...newTrip,
      id,
      startTime: new Date().toISOString(),
      endLocation: "",
    }, ...trips]);
    setNewTrip({ vehiclePlate: "", driverName: "", startLocation: "", purpose: "" });
    setIsAddDialogOpen(false);
    console.log("Trip started:", newTrip);
  };

  const tripCounts = {
    all: trips.length,
    ongoing: trips.filter(t => !t.endTime).length,
    completed: trips.filter(t => t.endTime).length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Trip Logs</h1>
          <p className="text-muted-foreground">Track and log vehicle trips</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-start-trip">
              <Plus className="h-4 w-4 mr-2" />
              Start Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Trip</DialogTitle>
              <DialogDescription>
                Log the start of a new trip.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vehiclePlate">Vehicle Plate</Label>
                <Input
                  id="vehiclePlate"
                  placeholder="ABC-1234"
                  value={newTrip.vehiclePlate}
                  onChange={(e) => setNewTrip({ ...newTrip, vehiclePlate: e.target.value })}
                  data-testid="input-trip-plate"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  placeholder="John Smith"
                  value={newTrip.driverName}
                  onChange={(e) => setNewTrip({ ...newTrip, driverName: e.target.value })}
                  data-testid="input-trip-driver"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startLocation">Start Location</Label>
                <Input
                  id="startLocation"
                  placeholder="Warehouse Central"
                  value={newTrip.startLocation}
                  onChange={(e) => setNewTrip({ ...newTrip, startLocation: e.target.value })}
                  data-testid="input-trip-start"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Select
                  value={newTrip.purpose}
                  onValueChange={(v) => setNewTrip({ ...newTrip, purpose: v })}
                >
                  <SelectTrigger data-testid="select-trip-purpose">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposes.map(purpose => (
                      <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleStartTrip} data-testid="button-confirm-trip">Start Trip</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trips..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-trips"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "ongoing", "completed"] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({tripCounts[f]})
          </Button>
        ))}
      </div>

      {filteredTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map(trip => (
            <TripLogCard
              key={trip.id}
              {...trip}
              onClick={() => console.log("Trip clicked:", trip.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No trips found.</p>
        </div>
      )}
    </div>
  );
}
