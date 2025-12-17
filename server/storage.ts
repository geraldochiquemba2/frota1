import { 
  type AdminUser, type InsertAdminUser,
  type Vehicle, type InsertVehicle,
  type Driver, type InsertDriver,
  type Trip, type InsertTrip,
  type Maintenance, type InsertMaintenance,
  type Alert, type InsertAlert,
  type Supplier, type InsertSupplier,
  type FuelLog, type InsertFuelLog,
  type BankAccount, type InsertBankAccount,
  type Transaction, type InsertTransaction,
  adminUsers, vehicles, drivers, trips, maintenance, alerts, suppliers, fuelLogs, bankAccounts, transactions
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

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
  getTripsByDriver(driverId: string): Promise<Trip[]>;
  getActiveTripByDriver(driverId: string): Promise<Trip | undefined>;
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
  getAlertsByDriver(driverId: string): Promise<Alert[]>;
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

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Fuel Logs
  getFuelLogs(): Promise<FuelLog[]>;
  getFuelLog(id: string): Promise<FuelLog | undefined>;
  getFuelLogsByVehicle(vehicleId: string): Promise<FuelLog[]>;
  createFuelLog(log: InsertFuelLog): Promise<FuelLog>;
  updateFuelLog(id: string, log: Partial<InsertFuelLog>): Promise<FuelLog | undefined>;
  deleteFuelLog(id: string): Promise<boolean>;
  getFuelStats(): Promise<{
    totalLiters: number;
    totalCost: number;
    avgEfficiency: number;
    recentLogs: FuelLog[];
  }>;

  // Bank Accounts
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccount(id: string): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: string, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: string): Promise<boolean>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  getTransactionsByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  getFinanceSummary(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthTransactions: number;
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

  async getTripsByDriver(driverId: string): Promise<Trip[]> {
    return db.select().from(trips).where(eq(trips.driverId, driverId)).orderBy(desc(trips.startTime));
  }

  async getActiveTripByDriver(driverId: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(and(eq(trips.driverId, driverId), eq(trips.status, "active")));
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

  async getAlertsByDriver(driverId: string): Promise<Alert[]> {
    return db.select().from(alerts).where(and(eq(alerts.driverId, driverId), eq(alerts.dismissed, false))).orderBy(desc(alerts.timestamp));
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

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  // Fuel Logs
  async getFuelLogs(): Promise<FuelLog[]> {
    return db.select().from(fuelLogs).orderBy(desc(fuelLogs.date));
  }

  async getFuelLog(id: string): Promise<FuelLog | undefined> {
    const [log] = await db.select().from(fuelLogs).where(eq(fuelLogs.id, id));
    return log;
  }

  async getFuelLogsByVehicle(vehicleId: string): Promise<FuelLog[]> {
    return db.select().from(fuelLogs).where(eq(fuelLogs.vehicleId, vehicleId)).orderBy(desc(fuelLogs.date));
  }

  async createFuelLog(log: InsertFuelLog): Promise<FuelLog> {
    const [newLog] = await db.insert(fuelLogs).values(log).returning();
    return newLog;
  }

  async updateFuelLog(id: string, log: Partial<InsertFuelLog>): Promise<FuelLog | undefined> {
    const [updated] = await db.update(fuelLogs).set(log).where(eq(fuelLogs.id, id)).returning();
    return updated;
  }

  async deleteFuelLog(id: string): Promise<boolean> {
    const result = await db.delete(fuelLogs).where(eq(fuelLogs.id, id)).returning();
    return result.length > 0;
  }

  async getFuelStats(): Promise<{
    totalLiters: number;
    totalCost: number;
    avgEfficiency: number;
    recentLogs: FuelLog[];
  }> {
    const allLogs = await db.select().from(fuelLogs).orderBy(desc(fuelLogs.date));
    
    const totalLiters = allLogs.reduce((sum, log) => sum + (log.liters || 0), 0);
    const totalCost = allLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    
    // Calculate average efficiency based on consecutive logs per vehicle
    let totalKm = 0;
    let totalLitersForEfficiency = 0;
    
    // Group logs by vehicle and calculate efficiency
    const logsByVehicle: { [key: string]: FuelLog[] } = {};
    for (const log of allLogs) {
      if (!logsByVehicle[log.vehicleId]) {
        logsByVehicle[log.vehicleId] = [];
      }
      logsByVehicle[log.vehicleId].push(log);
    }
    
    for (const vehicleLogs of Object.values(logsByVehicle)) {
      // Sort by date ascending for efficiency calculation
      const sorted = vehicleLogs.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      for (let i = 1; i < sorted.length; i++) {
        const kmDiff = sorted[i].odometer - sorted[i - 1].odometer;
        if (kmDiff > 0 && sorted[i].liters > 0) {
          totalKm += kmDiff;
          totalLitersForEfficiency += sorted[i].liters;
        }
      }
    }
    
    const avgEfficiency = totalLitersForEfficiency > 0 
      ? totalKm / totalLitersForEfficiency 
      : 0;
    
    return {
      totalLiters,
      totalCost,
      avgEfficiency,
      recentLogs: allLogs.slice(0, 5),
    };
  }

  // Bank Accounts
  async getBankAccounts(): Promise<BankAccount[]> {
    return db.select().from(bankAccounts);
  }

  async getBankAccount(id: string): Promise<BankAccount | undefined> {
    const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id));
    return account;
  }

  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [newAccount] = await db.insert(bankAccounts).values(account).returning();
    return newAccount;
  }

  async updateBankAccount(id: string, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const [updated] = await db.update(bankAccounts).set(account).where(eq(bankAccounts.id, id)).returning();
    return updated;
  }

  async deleteBankAccount(id: string): Promise<boolean> {
    const result = await db.delete(bankAccounts).where(eq(bankAccounts.id, id)).returning();
    return result.length > 0;
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByPeriod(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return db.select().from(transactions)
      .where(and(
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      ))
      .orderBy(desc(transactions.date));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async updateTransaction(id: string, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const [updated] = await db.update(transactions).set(transaction).where(eq(transactions.id, id)).returning();
    return updated;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result.length > 0;
  }

  async getFinanceSummary(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthTransactions: number;
  }> {
    const allTransactions = await db.select().from(transactions);
    
    const totalIncome = allTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTransactions = allTransactions.filter(
      t => new Date(t.date) >= startOfMonth
    ).length;

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthTransactions,
    };
  }
}

export const storage = new DatabaseStorage();
