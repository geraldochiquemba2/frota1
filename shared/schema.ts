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
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  distance: integer("distance"),
  purpose: varchar("purpose", { length: 100 }),
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
