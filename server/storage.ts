import { 
  type AdminUser, type InsertAdminUser,
  type Vehicle, type InsertVehicle,
  type Driver, type InsertDriver,
  type Trip, type InsertTrip,
  type Maintenance, type InsertMaintenance,
  type Alert, type InsertAlert,
  adminUsers, vehicles, drivers, trips, maintenance, alerts
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Admin Users
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByPhone(phone: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  ensureAdminExists(): Promise<void>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Drivers
  getDrivers(): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByPhone(phone: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: string): Promise<boolean>;

  // Trips
  getTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined>;

  // Maintenance
  getMaintenanceRecords(): Promise<Maintenance[]>;
  getMaintenance(id: string): Promise<Maintenance | undefined>;
  createMaintenance(record: InsertMaintenance): Promise<Maintenance>;
  updateMaintenance(id: string, record: Partial<InsertMaintenance>): Promise<Maintenance | undefined>;

  // Alerts
  getAlerts(): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  dismissAlert(id: string): Promise<boolean>;
  dismissAllAlerts(): Promise<boolean>;

  // Metrics
  getMetrics(): Promise<{
    totalVehicles: number;
    activeDrivers: number;
    activeAlerts: number;
    maintenanceDue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Admin Users
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByPhone(phone: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.phone, phone));
    return user;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(insertUser).returning();
    return user;
  }

  async ensureAdminExists(): Promise<void> {
    const existingAdmin = await this.getAdminUserByPhone("912345678");
    if (!existingAdmin) {
      await this.createAdminUser({
        phone: "912345678",
        password: "123456789",
        name: "Administrador",
      });
    }
  }

  // Vehicles
  async getVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle;
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [newVehicle] = await db.insert(vehicles).values(vehicle).returning();
    return newVehicle;
  }

  async updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [updated] = await db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return updated;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }

  // Drivers
  async getDrivers(): Promise<Driver[]> {
    return db.select().from(drivers);
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByPhone(phone: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.phone, phone));
    return driver;
  }

  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db.insert(drivers).values(driver).returning();
    return newDriver;
  }

  async updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined> {
    const [updated] = await db.update(drivers).set(driver).where(eq(drivers.id, id)).returning();
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    const result = await db.delete(drivers).where(eq(drivers.id, id)).returning();
    return result.length > 0;
  }

  // Trips
  async getTrips(): Promise<Trip[]> {
    return db.select().from(trips).orderBy(desc(trips.startTime));
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [newTrip] = await db.insert(trips).values(trip).returning();
    return newTrip;
  }

  async updateTrip(id: string, trip: Partial<Trip>): Promise<Trip | undefined> {
    const [updated] = await db.update(trips).set(trip).where(eq(trips.id, id)).returning();
    return updated;
  }

  // Maintenance
  async getMaintenanceRecords(): Promise<Maintenance[]> {
    return db.select().from(maintenance);
  }

  async getMaintenance(id: string): Promise<Maintenance | undefined> {
    const [record] = await db.select().from(maintenance).where(eq(maintenance.id, id));
    return record;
  }

  async createMaintenance(record: InsertMaintenance): Promise<Maintenance> {
    const [newRecord] = await db.insert(maintenance).values(record).returning();
    return newRecord;
  }

  async updateMaintenance(id: string, record: Partial<InsertMaintenance>): Promise<Maintenance | undefined> {
    const [updated] = await db.update(maintenance).set(record).where(eq(maintenance.id, id)).returning();
    return updated;
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).where(eq(alerts.dismissed, false)).orderBy(desc(alerts.timestamp));
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert;
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db.insert(alerts).values(alert).returning();
    return newAlert;
  }

  async dismissAlert(id: string): Promise<boolean> {
    const result = await db.update(alerts).set({ dismissed: true }).where(eq(alerts.id, id)).returning();
    return result.length > 0;
  }

  async dismissAllAlerts(): Promise<boolean> {
    await db.update(alerts).set({ dismissed: true }).where(eq(alerts.dismissed, false));
    return true;
  }

  // Metrics
  async getMetrics(): Promise<{
    totalVehicles: number;
    activeDrivers: number;
    activeAlerts: number;
    maintenanceDue: number;
  }> {
    const allVehicles = await db.select().from(vehicles);
    const allDrivers = await db.select().from(drivers);
    const activeAlertsList = await db.select().from(alerts).where(eq(alerts.dismissed, false));
    const maintenanceList = await db.select().from(maintenance).where(
      and(
        eq(maintenance.status, "scheduled"),
      )
    );

    return {
      totalVehicles: allVehicles.length,
      activeDrivers: allDrivers.filter(d => d.status === "on-trip" || d.status === "available").length,
      activeAlerts: activeAlertsList.length,
      maintenanceDue: maintenanceList.length,
    };
  }
}

export const storage = new DatabaseStorage();
