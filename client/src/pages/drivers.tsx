import { useState } from "react";
import { DriverCard } from "@/components/fleet/DriverCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Search } from "lucide-react";

// todo: remove mock functionality
const mockDrivers = [
  { id: "d1", name: "John Smith", phone: "+55 11 99999-1234", email: "john.smith@example.com", licenseExpiry: "2025-06-15", status: "on-trip" as const, assignedVehicle: "ABC-1234" },
  { id: "d2", name: "Maria Santos", phone: "+55 11 88888-5678", email: "maria.santos@example.com", licenseExpiry: "2025-01-10", status: "available" as const },
  { id: "d3", name: "Carlos Oliveira", phone: "+55 11 77777-9012", email: "carlos.oliveira@example.com", licenseExpiry: "2024-12-20", status: "off-duty" as const, assignedVehicle: "XYZ-5678" },
  { id: "d4", name: "Ana Silva", phone: "+55 11 66666-3456", email: "ana.silva@example.com", licenseExpiry: "2026-03-20", status: "on-trip" as const, assignedVehicle: "JKL-7890" },
  { id: "d5", name: "Pedro Costa", phone: "+55 11 55555-7890", email: "pedro.costa@example.com", licenseExpiry: "2025-09-01", status: "available" as const },
  { id: "d6", name: "Lucia Ferreira", phone: "+55 11 44444-2345", email: "lucia.ferreira@example.com", licenseExpiry: "2025-04-15", status: "off-duty" as const },
];

export default function Drivers() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "on-trip" | "off-duty">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: "",
    phone: "",
    email: "",
    licenseExpiry: "",
  });

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddDriver = () => {
    const id = `d${Date.now()}`;
    setDrivers([...drivers, {
      ...newDriver,
      id,
      status: "available" as const,
    }]);
    setNewDriver({ name: "", phone: "", email: "", licenseExpiry: "" });
    setIsAddDialogOpen(false);
    console.log("Driver added:", newDriver);
  };

  const statusCounts = {
    all: drivers.length,
    available: drivers.filter(d => d.status === "available").length,
    "on-trip": drivers.filter(d => d.status === "on-trip").length,
    "off-duty": drivers.filter(d => d.status === "off-duty").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Drivers</h1>
          <p className="text-muted-foreground">Manage your fleet drivers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-driver">
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>
                Enter the driver details to add them to your fleet.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  data-testid="input-driver-name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+55 11 99999-0000"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                  data-testid="input-driver-phone"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="driver@example.com"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  data-testid="input-driver-email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="licenseExpiry">License Expiry Date</Label>
                <Input
                  id="licenseExpiry"
                  type="date"
                  value={newDriver.licenseExpiry}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseExpiry: e.target.value })}
                  data-testid="input-driver-license"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddDriver} data-testid="button-confirm-add-driver">Add Driver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drivers..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-drivers"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "available", "on-trip", "off-duty"] as const).map(status => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === "all" ? "All" : status === "on-trip" ? "On Trip" : status === "off-duty" ? "Off Duty" : "Available"}
            {" "}({statusCounts[status]})
          </Button>
        ))}
      </div>

      {filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(driver => (
            <DriverCard
              key={driver.id}
              {...driver}
              onClick={() => console.log("Driver clicked:", driver.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No drivers found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
