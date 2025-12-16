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

  // ==================== DRIVER ROUTES ====================
  
  // Get driver profile (self)
  app.get("/api/driver/profile", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const driver = await storage.getDriver(req.session.userId);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar perfil" });
    }
  });

  // Get driver's trips
  app.get("/api/driver/trips", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const tripsList = await storage.getTripsByDriver(req.session.userId);
      res.json(tripsList);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagens" });
    }
  });

  // Get driver's active trip
  app.get("/api/driver/trips/active", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const trip = await storage.getActiveTripByDriver(req.session.userId);
      res.json(trip || null);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagem ativa" });
    }
  });

  // Start a new trip
  app.post("/api/driver/trips/start", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      // Check if there's already an active trip
      const activeTrip = await storage.getActiveTripByDriver(req.session.userId);
      if (activeTrip) {
        return res.status(400).json({ error: "Você já tem uma viagem ativa" });
      }
      
      const driver = await storage.getDriver(req.session.userId);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }

      // Get assigned vehicle
      let vehicle = null;
      if (driver.assignedVehicleId) {
        vehicle = await storage.getVehicle(driver.assignedVehicleId);
      }

      const { startLocation, purpose, startOdometer } = req.body;
      
      const trip = await storage.createTrip({
        vehicleId: vehicle?.id || "unassigned",
        vehiclePlate: vehicle?.plate || "N/A",
        driverId: driver.id,
        driverName: driver.name,
        startLocation: startLocation || driver.homeBase || "Localização não informada",
        purpose: purpose || "Viagem de trabalho",
        status: "active",
        startOdometer: startOdometer || null,
      });

      // Update driver status
      await storage.updateDriver(driver.id, { status: "on_trip" });

      res.status(201).json(trip);
    } catch (error) {
      console.error("Error starting trip:", error);
      res.status(500).json({ error: "Erro ao iniciar viagem" });
    }
  });

  // Complete a trip
  app.post("/api/driver/trips/:id/complete", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      const trip = await storage.getTrip(req.params.id);
      if (!trip || trip.driverId !== req.session.userId) {
        return res.status(404).json({ error: "Viagem não encontrada" });
      }

      if (trip.status !== "active") {
        return res.status(400).json({ error: "Esta viagem já foi finalizada" });
      }

      const { endLocation, endOdometer } = req.body;
      
      // Calculate distance if odometers provided
      let distance = null;
      if (trip.startOdometer && endOdometer) {
        distance = endOdometer - trip.startOdometer;
      }

      const updatedTrip = await storage.updateTrip(trip.id, {
        endLocation: endLocation || "Destino não informado",
        endTime: new Date(),
        status: "completed",
        endOdometer: endOdometer || null,
        distance: distance,
      });

      // Update driver status
      await storage.updateDriver(req.session.userId, { status: "available" });

      // Check mileage threshold and create alert if needed
      const driver = await storage.getDriver(req.session.userId);
      if (driver?.mileageAlertThreshold && driver.alertsEnabled && distance) {
        if (distance >= driver.mileageAlertThreshold) {
          await storage.createAlert({
            type: "mileage",
            title: "Limite de Quilometragem Atingido",
            description: `O motorista ${driver.name} percorreu ${distance}km, ultrapassando o limite de ${driver.mileageAlertThreshold}km definido.`,
            vehicleId: trip.vehicleId !== "unassigned" ? trip.vehicleId : null,
            driverId: driver.id,
          });
        }
      }

      res.json(updatedTrip);
    } catch (error) {
      console.error("Error completing trip:", error);
      res.status(500).json({ error: "Erro ao finalizar viagem" });
    }
  });

  // Get driver's alerts
  app.get("/api/driver/alerts", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const alertsList = await storage.getAlertsByDriver(req.session.userId);
      res.json(alertsList);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar alertas" });
    }
  });

  // Dismiss driver's alert
  app.patch("/api/driver/alerts/:id/dismiss", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      const alert = await storage.getAlert(req.params.id);
      if (!alert || alert.driverId !== req.session.userId) {
        return res.status(404).json({ error: "Alerta não encontrado" });
      }

      const dismissed = await storage.dismissAlert(req.params.id);
      res.json({ success: dismissed });
    } catch (error) {
      res.status(500).json({ error: "Erro ao dispensar alerta" });
    }
  });

  // Get assigned vehicle for driver
  app.get("/api/driver/vehicle", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      
      const driver = await storage.getDriver(req.session.userId);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }

      if (!driver.assignedVehicleId) {
        return res.json(null);
      }

      const vehicle = await storage.getVehicle(driver.assignedVehicleId);
      res.json(vehicle || null);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar veículo" });
    }
  });

  return httpServer;
}
