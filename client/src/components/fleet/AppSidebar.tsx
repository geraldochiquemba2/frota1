import { useLocation, Link } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Truck,
  Users,
  Wrench,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  Building2,
  Fuel,
  Wallet,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Painel", url: "/", icon: LayoutDashboard },
  { title: "Veículos", url: "/vehicles", icon: Truck },
  { title: "Motoristas", url: "/drivers", icon: Users },
  { title: "Manutenção", url: "/maintenance", icon: Wrench },
  { title: "Combustível", url: "/fuel", icon: Fuel },
  { title: "Finanças", url: "/finance", icon: Wallet },
  { title: "Registro de Viagens", url: "/trips", icon: ClipboardList },
  { title: "Fornecedores", url: "/suppliers", icon: Building2 },
  { title: "Inventário", url: "/inventory", icon: Package },
  { title: "Alertas", url: "/alerts", icon: Bell },
];

const bottomNavItems = [
  { title: "Configurações", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    photo?: string;
  };
  onLogout?: () => void;
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">FleetTrack</h1>
            <p className="text-xs text-muted-foreground">Gestão de Frotas</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback>
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" data-testid="button-login">
            Entrar
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
