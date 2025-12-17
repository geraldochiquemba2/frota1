import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVehicleSchema, insertDriverSchema, insertTripSchema, insertMaintenanceSchema, insertAlertSchema, insertSupplierSchema, insertFuelLogSchema, insertBankAccountSchema, insertTransactionSchema, insertInventoryItemSchema } from "@shared/schema";

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

  // Assign driver to vehicle
  app.post("/api/vehicles/:id/assign-driver", async (req, res) => {
    try {
      const { driverId } = req.body;
      
      // Validate driverId is string or null
      if (driverId !== null && driverId !== undefined && typeof driverId !== 'string') {
        return res.status(400).json({ error: "driverId deve ser uma string ou null" });
      }
      
      const vehicleId = req.params.id;
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Veículo não encontrado" });
      }

      // If driverId is null, unassign driver
      if (!driverId) {
        // Unassign previous driver if exists
        if (vehicle.driverId) {
          await storage.updateDriver(vehicle.driverId, { assignedVehicleId: null });
        }
        const updatedVehicle = await storage.updateVehicle(vehicleId, { driverId: null });
        return res.json(updatedVehicle);
      }

      const driver = await storage.getDriver(driverId);
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }

      // Unassign previous driver from this vehicle if exists
      if (vehicle.driverId && vehicle.driverId !== driverId) {
        await storage.updateDriver(vehicle.driverId, { assignedVehicleId: null });
      }

      // Unassign this driver from previous vehicle if exists
      if (driver.assignedVehicleId && driver.assignedVehicleId !== vehicleId) {
        await storage.updateVehicle(driver.assignedVehicleId, { driverId: null });
      }

      // Assign driver to vehicle (both directions)
      const updatedVehicle = await storage.updateVehicle(vehicleId, { driverId });
      await storage.updateDriver(driverId, { assignedVehicleId: vehicleId });

      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error assigning driver:", error);
      res.status(500).json({ error: "Erro ao atribuir motorista" });
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

  // Get all active trips (for central monitoring) - must be before :id route
  app.get("/api/trips/active", async (req, res) => {
    try {
      const allTrips = await storage.getTrips();
      const activeTrips = allTrips.filter(t => t.status === "active");
      res.json(activeTrips);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar viagens ativas" });
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

  // Update driver profile (self)
  app.patch("/api/driver/profile", async (req: any, res) => {
    try {
      if (!req.session.userId || req.session.userType !== "driver") {
        return res.status(401).json({ error: "Não autorizado" });
      }
      const { photo } = req.body;
      const driver = await storage.updateDriver(req.session.userId, { photo });
      if (!driver) {
        return res.status(404).json({ error: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  // Update trip location (for real-time tracking)
  app.patch("/api/driver/trips/:id/location", async (req: any, res) => {
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

      const { currentLat, currentLng } = req.body;
      
      const updatedTrip = await storage.updateTrip(trip.id, {
        currentLat,
        currentLng,
      });

      // Also update vehicle location for real-time map tracking
      if (trip.vehicleId && trip.vehicleId !== "unassigned") {
        await storage.updateVehicle(trip.vehicleId, {
          lat: currentLat,
          lng: currentLng,
          status: "active",
        });
      }

      res.json(updatedTrip);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar localização" });
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

      const { startLocation, destination, purpose, startOdometer, startLat, startLng } = req.body;
      
      const trip = await storage.createTrip({
        vehicleId: vehicle?.id || "unassigned",
        vehiclePlate: vehicle?.plate || "N/A",
        driverId: driver.id,
        driverName: driver.name,
        startLocation: startLocation || driver.homeBase || "Localização não informada",
        destination: destination || null,
        purpose: purpose || "Viagem de trabalho",
        status: "active",
        startOdometer: startOdometer || null,
        startLat: startLat || null,
        startLng: startLng || null,
        currentLat: startLat || null,
        currentLng: startLng || null,
      });

      // Update driver status
      await storage.updateDriver(driver.id, { status: "on_trip" });

      // Update vehicle location and status for real-time tracking
      if (vehicle && startLat && startLng) {
        await storage.updateVehicle(vehicle.id, {
          lat: startLat,
          lng: startLng,
          status: "active",
        });
      }

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

  // ==================== SUPPLIERS ROUTES ====================
  
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliersList = await storage.getSuppliers();
      res.json(suppliersList);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      res.status(500).json({ error: "Erro ao buscar fornecedores" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ error: "Fornecedor não encontrado" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar fornecedor" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const parsed = insertSupplierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const supplier = await storage.createSupplier(parsed.data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Erro ao criar fornecedor" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.updateSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ error: "Fornecedor não encontrado" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar fornecedor" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Fornecedor não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir fornecedor" });
    }
  });

  // ==================== FUEL LOGS ROUTES ====================

  app.get("/api/fuel", async (req, res) => {
    try {
      const logs = await storage.getFuelLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching fuel logs:", error);
      res.status(500).json({ error: "Erro ao buscar abastecimentos" });
    }
  });

  app.get("/api/fuel/stats", async (req, res) => {
    try {
      const stats = await storage.getFuelStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching fuel stats:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas de combustível" });
    }
  });

  app.get("/api/fuel/vehicle/:vehicleId", async (req, res) => {
    try {
      const logs = await storage.getFuelLogsByVehicle(req.params.vehicleId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar abastecimentos do veículo" });
    }
  });

  app.get("/api/fuel/:id", async (req, res) => {
    try {
      const log = await storage.getFuelLog(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Abastecimento não encontrado" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar abastecimento" });
    }
  });

  app.post("/api/fuel", async (req, res) => {
    try {
      const parsed = insertFuelLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const log = await storage.createFuelLog(parsed.data);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating fuel log:", error);
      res.status(500).json({ error: "Erro ao registrar abastecimento" });
    }
  });

  app.patch("/api/fuel/:id", async (req, res) => {
    try {
      const log = await storage.updateFuelLog(req.params.id, req.body);
      if (!log) {
        return res.status(404).json({ error: "Abastecimento não encontrado" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar abastecimento" });
    }
  });

  app.delete("/api/fuel/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFuelLog(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Abastecimento não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir abastecimento" });
    }
  });

  // ==================== FINANCE ROUTES ====================

  // Bank Accounts
  app.get("/api/finance/accounts", async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ error: "Erro ao buscar contas bancárias" });
    }
  });

  app.get("/api/finance/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getBankAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar conta bancária" });
    }
  });

  app.post("/api/finance/accounts", async (req, res) => {
    try {
      const parsed = insertBankAccountSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const account = await storage.createBankAccount(parsed.data);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ error: "Erro ao criar conta bancária" });
    }
  });

  app.patch("/api/finance/accounts/:id", async (req, res) => {
    try {
      const account = await storage.updateBankAccount(req.params.id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar conta bancária" });
    }
  });

  app.delete("/api/finance/accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBankAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Conta não encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir conta bancária" });
    }
  });

  // Transactions
  app.get("/api/finance/transactions", async (req, res) => {
    try {
      const allTransactions = await storage.getTransactions();
      res.json(allTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Erro ao buscar transações" });
    }
  });

  app.get("/api/finance/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar transação" });
    }
  });

  app.post("/api/finance/transactions", async (req, res) => {
    try {
      const parsed = insertTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const transaction = await storage.createTransaction(parsed.data);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(500).json({ error: "Erro ao criar transação" });
    }
  });

  app.patch("/api/finance/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.updateTransaction(req.params.id, req.body);
      if (!transaction) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar transação" });
    }
  });

  app.delete("/api/finance/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Transação não encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir transação" });
    }
  });

  // Finance Summary
  app.get("/api/finance/summary", async (req, res) => {
    try {
      const summary = await storage.getFinanceSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching finance summary:", error);
      res.status(500).json({ error: "Erro ao buscar resumo financeiro" });
    }
  });

  // ==================== INVENTORY ROUTES ====================

  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Erro ao buscar itens do inventário" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const items = await storage.getLowStockItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ error: "Erro ao buscar itens com stock baixo" });
    }
  });

  app.get("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.getInventoryItem(req.params.id);
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar item" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const parsed = insertInventoryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Dados inválidos", details: parsed.error });
      }
      const item = await storage.createInventoryItem(parsed.data);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ error: "Erro ao criar item" });
    }
  });

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const item = await storage.updateInventoryItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar item" });
    }
  });

  app.delete("/api/inventory/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteInventoryItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Erro ao excluir item" });
    }
  });

  return httpServer;
}
