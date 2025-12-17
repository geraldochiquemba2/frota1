import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  password: varchar("password", { length: 100 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plate: varchar("plate", { length: 20 }).notNull().unique(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("idle"),
  driverId: varchar("driver_id"),
  location: text("location"),
  fuelLevel: integer("fuel_level").default(100),
  odometer: integer("odometer").default(0),
  lat: real("lat"),
  lng: real("lng"),
  photos: text("photos").array(),
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// Drivers table
export const drivers = pgTable("drivers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull().unique(),
  email: varchar("email", { length: 200 }),
  password: varchar("password", { length: 200 }),
  licenseExpiry: varchar("license_expiry", { length: 20 }),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  assignedVehicleId: varchar("assigned_vehicle_id"),
  photo: text("photo"),
  homeBase: varchar("home_base", { length: 200 }),
  mileageAlertThreshold: integer("mileage_alert_threshold"),
  alertsEnabled: boolean("alerts_enabled").default(true),
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
});

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

// Trips table
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  driverId: varchar("driver_id"),
  driverName: varchar("driver_name", { length: 200 }).notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location"),
  destination: text("destination"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  distance: integer("distance"),
  purpose: varchar("purpose", { length: 100 }),
  status: varchar("trip_status", { length: 20 }).notNull().default("active"),
  startOdometer: integer("start_odometer"),
  endOdometer: integer("end_odometer"),
  startLat: real("start_lat"),
  startLng: real("start_lng"),
  currentLat: real("current_lat"),
  currentLng: real("current_lng"),
  destLat: real("dest_lat"),
  destLng: real("dest_lng"),
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  startTime: true,
  endTime: true,
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

// Maintenance table
export const maintenance = pgTable("maintenance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id"),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  scheduledDate: varchar("scheduled_date", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("scheduled"),
  description: text("description"),
});

export const insertMaintenanceSchema = createInsertSchema(maintenance).omit({
  id: true,
});

export type InsertMaintenance = z.infer<typeof insertMaintenanceSchema>;
export type Maintenance = typeof maintenance.$inferSelect;

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 30 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  vehicleId: varchar("vehicle_id"),
  driverId: varchar("driver_id"),
  dismissed: boolean("dismissed").default(false),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  contact: varchar("contact", { length: 100 }),
  categories: text("categories").array(),
  address: text("address"),
  notes: text("notes"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Fuel Logs table
export const fuelLogs = pgTable("fuel_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }).notNull(),
  driverId: varchar("driver_id"),
  driverName: varchar("driver_name", { length: 200 }),
  date: timestamp("date").notNull().defaultNow(),
  odometer: integer("odometer").notNull(),
  liters: real("liters").notNull(),
  pricePerLiter: real("price_per_liter").notNull(),
  totalCost: real("total_cost").notNull(),
  fuelType: varchar("fuel_type", { length: 30 }),
  station: varchar("station", { length: 200 }),
  supplierId: varchar("supplier_id"),
  notes: text("notes"),
});

export const insertFuelLogSchema = createInsertSchema(fuelLogs).omit({
  id: true,
  date: true,
});

export type InsertFuelLog = z.infer<typeof insertFuelLogSchema>;
export type FuelLog = typeof fuelLogs.$inferSelect;

// Bank Accounts table
export const bankAccounts = pgTable("bank_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  bank: varchar("bank", { length: 100 }),
  accountNumber: varchar("account_number", { length: 50 }),
  balance: real("balance").default(0),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
});

export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

// Transactions table
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bankAccountId: varchar("bank_account_id"),
  type: varchar("type", { length: 20 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: real("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description"),
  vehicleId: varchar("vehicle_id"),
  vehiclePlate: varchar("vehicle_plate", { length: 20 }),
  supplierId: varchar("supplier_id"),
  tripId: varchar("trip_id"),
  invoiceRef: varchar("invoice_ref", { length: 100 }),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Inventory Items table (parts and consumables)
export const inventoryItems = pgTable("inventory_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 200 }).notNull(),
  partNumber: varchar("part_number", { length: 100 }),
  category: varchar("category", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  minQuantity: integer("min_quantity").default(5),
  unit: varchar("unit", { length: 30 }).default("unidade"),
  unitPrice: real("unit_price"),
  location: varchar("location", { length: 200 }),
  supplierId: varchar("supplier_id"),
  notes: text("notes"),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
});

export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;
export type InventoryItem = typeof inventoryItems.$inferSelect;
