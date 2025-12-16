import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/fleet/ThemeProvider";
import { Bell, Moon, Sun, Globe, Shield, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: "FleetTrack Ltda.",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    alerts: {
      lowFuel: true,
      speeding: true,
      maintenance: true,
      documentExpiry: true,
    },
  });

  const handleSave = () => {
    console.log("Settings saved:", settings);
    toast({
      title: "Configurações salvas",
      description: "Suas preferências foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as preferências do aplicativo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>Configure as preferências da empresa e região</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              data-testid="input-company-name"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select
                value={settings.timezone}
                onValueChange={(v) => setSettings({ ...settings, timezone: v })}
              >
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tóquio (GMT+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(v) => setSettings({ ...settings, language: v })}
              >
                <SelectTrigger data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Aparência
          </CardTitle>
          <CardDescription>Personalize a aparência do aplicativo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tema</p>
              <p className="text-sm text-muted-foreground">Escolha entre modo claro e escuro</p>
            </div>
            <Select value={theme} onValueChange={(v: "light" | "dark" | "system") => setTheme(v)}>
              <SelectTrigger className="w-32" data-testid="select-theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>Configure como você recebe notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações por E-mail</p>
              <p className="text-sm text-muted-foreground">Receba alertas por e-mail</p>
            </div>
            <Switch
              checked={settings.notifications.email}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: checked },
                })
              }
              data-testid="switch-email-notifications"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações Push</p>
              <p className="text-sm text-muted-foreground">Receba notificações push no navegador</p>
            </div>
            <Switch
              checked={settings.notifications.push}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: checked },
                })
              }
              data-testid="switch-push-notifications"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações por SMS</p>
              <p className="text-sm text-muted-foreground">Receba alertas críticos por SMS</p>
            </div>
            <Switch
              checked={settings.notifications.sms}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sms: checked },
                })
              }
              data-testid="switch-sms-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Preferências de Alertas
          </CardTitle>
          <CardDescription>Escolha quais alertas você deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Combustível Baixo</p>
              <p className="text-sm text-muted-foreground">Quando o combustível do veículo cair abaixo de 20%</p>
            </div>
            <Switch
              checked={settings.alerts.lowFuel}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, lowFuel: checked },
                })
              }
              data-testid="switch-low-fuel"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Velocidade</p>
              <p className="text-sm text-muted-foreground">Quando o motorista exceder limites de velocidade</p>
            </div>
            <Switch
              checked={settings.alerts.speeding}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, speeding: checked },
                })
              }
              data-testid="switch-speeding"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Manutenção</p>
              <p className="text-sm text-muted-foreground">Quando manutenção agendada estiver próxima</p>
            </div>
            <Switch
              checked={settings.alerts.maintenance}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, maintenance: checked },
                })
              }
              data-testid="switch-maintenance"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Documentos Expirando</p>
              <p className="text-sm text-muted-foreground">Quando CNHs ou documentos estiverem expirando</p>
            </div>
            <Switch
              checked={settings.alerts.documentExpiry}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  alerts: { ...settings.alerts, documentExpiry: checked },
                })
              }
              data-testid="switch-document-expiry"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} data-testid="button-save-settings">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
