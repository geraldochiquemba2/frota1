import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertDriverSchema, insertTripSchema, insertMaintenanceSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar métricas" });
    }
  });

  // Vehicles
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar veículos" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar veículo" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const parsed = insertVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const vehicle = await storage.createVehicle(parsed.data);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar veículo" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar veículo" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir veículo" });
    }
  });

  // Drivers
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar motoristas" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(req.params.id);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar motorista" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const parsed = insertDriverSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const driver = await storage.createDriver(parsed.data);
      res.status(201).json(driver);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar motorista" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.updateDriver(req.params.id, req.body);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar motorista" });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDriver(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir motorista" });
    }
  });

  // Trips
  app.get("/api/trips", async (req, res) => {
    try {
      const tripsList = await storage.getTrips();
      res.json(tripsList);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagens" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagem" });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const parsed = insertTripSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const trip = await storage.createTrip(parsed.data);
      res.status(201).json(trip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar viagem" });
    }
  });

  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar viagem" });
    }
  });

  // Maintenance
  app.get("/api/maintenance", async (req, res) => {
    try {
      const records = await storage.getMaintenanceRecords();
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar manutenções" });
    }
  });

  app.get("/api/maintenance/:id", async (req, res) => {
    try {
      const record = await storage.getMaintenance(req.params.id);
      if (!record) {
        return res.status(404).json({ error: "Manutenção não encontrada" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar manutenção" });
    }
  });

  app.post("/api/maintenance", async (req, res) => {
    try {
      const parsed = insertMaintenanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const record = await storage.createMaintenance(parsed.data);
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar manutenção" });
    }
  });

  app.patch("/api/maintenance/:id", async (req, res) => {
    try {
      const record = await storage.updateMaintenance(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ error: "Manutenção não encontrada" });
      }
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar manutenção" });
    }
  });

  // Alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const alertsList = await storage.getAlerts();
      res.json(alertsList);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar alertas" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const parsed = insertAlertSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const alert = await storage.createAlert(parsed.data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar alerta" });
    }
  });

  app.patch("/api/alerts/:id/dismiss", async (req, res) => {
    try {
      const dismissed = await storage.dismissAlert(req.params.id);
      if (!dismissed) {
        return res.status(404).json({ error: "Alerta não encontrado" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao dispensar alerta" });
    }
  });

  app.post("/api/alerts/dismiss-all", async (req, res) => {
    try {
      await storage.dismissAllAlerts();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao dispensar alertas" });
    }
  });

  return httpServer;
}
