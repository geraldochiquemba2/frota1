import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/fleet/AppSidebar";
import { ThemeProvider } from "@/components/fleet/ThemeProvider";
import { ThemeToggle } from "@/components/fleet/ThemeToggle";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut, Truck } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import Drivers from "@/pages/drivers";
import Maintenance from "@/pages/maintenance";
import Trips from "@/pages/trips";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import DriverDashboard from "@/pages/driver-dashboard";
import Suppliers from "@/pages/suppliers";
import Fuel from "@/pages/fuel";
import Finance from "@/pages/finance";
import Inventory from "@/pages/inventory";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/drivers" component={Drivers} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/fuel" component={Fuel} />
      <Route path="/finance" component={Finance} />
      <Route path="/trips" component={Trips} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function LoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

function DriverApp() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">FleetTrack</h1>
              <p className="text-xs text-muted-foreground">Área do Motorista</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <main>
        <DriverDashboard />
      </main>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleLogout = async () => {
    await logout();
  };

  const userData = user ? {
    name: user.name || "Usuário",
    email: user.phone || "",
  } : undefined;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar user={userData} onLogout={handleLogout} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-3 border-b bg-background sticky top-0 z-50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isLoading, isAuthenticated, isDriver } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  if (isDriver) {
    return <DriverApp />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
