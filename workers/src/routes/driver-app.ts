import { Hono } from "hono";
import { createDb } from "../lib/db";
import { drivers, trips, vehicles, alerts } from "../schema";
import { eq, desc, and } from "drizzle-orm";
import { authMiddleware, driverMiddleware } from "../middleware/auth";
import type { AppEnv } from "../index";

export const driverAppRoutes = new Hono<AppEnv>();

driverAppRoutes.use("*", authMiddleware);
driverAppRoutes.use("*", driverMiddleware);

driverAppRoutes.get("/profile", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, user.userId));

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    return c.json(driver);
  } catch (error) {
    return c.json({ error: "Erro ao buscar perfil" }, 500);
  }
});

driverAppRoutes.patch("/profile", async (c) => {
  try {
    const user = c.get("user");
    const { photo } = await c.req.json();
    const db = createDb(c.env.DATABASE_URL);

    const [driver] = await db
      .update(drivers)
      .set({ photo })
      .where(eq(drivers.id, user.userId))
      .returning();

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    return c.json(driver);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar perfil" }, 500);
  }
});

driverAppRoutes.get("/trips", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const tripsList = await db
      .select()
      .from(trips)
      .where(eq(trips.driverId, user.userId))
      .orderBy(desc(trips.startTime));

    return c.json(tripsList);
  } catch (error) {
    return c.json({ error: "Erro ao buscar viagens" }, 500);
  }
});

driverAppRoutes.get("/trips/active", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.driverId, user.userId), eq(trips.status, "active")));

    return c.json(trip || null);
  } catch (error) {
    return c.json({ error: "Erro ao buscar viagem ativa" }, 500);
  }
});

driverAppRoutes.post("/trips/start", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const [activeTrip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.driverId, user.userId), eq(trips.status, "active")));

    if (activeTrip) {
      return c.json({ error: "Você já tem uma viagem ativa" }, 400);
    }

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, user.userId));

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    let vehicle = null;
    if (driver.assignedVehicleId) {
      const [v] = await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, driver.assignedVehicleId));
      vehicle = v;
    }

    const { startLocation, destination, purpose, startOdometer, startLat, startLng } =
      await c.req.json();

    const [trip] = await db
      .insert(trips)
      .values({
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
      })
      .returning();

    await db
      .update(drivers)
      .set({ status: "on-trip" })
      .where(eq(drivers.id, driver.id));

    if (vehicle && startLat && startLng) {
      await db
        .update(vehicles)
        .set({ lat: startLat, lng: startLng, status: "active" })
        .where(eq(vehicles.id, vehicle.id));
    }

    return c.json(trip, 201);
  } catch (error) {
    console.error("Error starting trip:", error);
    return c.json({ error: "Erro ao iniciar viagem" }, 500);
  }
});

driverAppRoutes.post("/trips/:id/complete", async (c) => {
  try {
    const user = c.get("user");
    const tripId = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

    if (!trip || trip.driverId !== user.userId) {
      return c.json({ error: "Viagem não encontrada" }, 404);
    }

    if (trip.status !== "active") {
      return c.json({ error: "Esta viagem já foi finalizada" }, 400);
    }

    const { endLocation, endOdometer } = await c.req.json();

    let distance = null;
    if (trip.startOdometer && endOdometer) {
      distance = endOdometer - trip.startOdometer;
    }

    const [updatedTrip] = await db
      .update(trips)
      .set({
        endLocation: endLocation || "Destino não informado",
        endTime: new Date(),
        status: "completed",
        endOdometer: endOdometer || null,
        distance: distance,
      })
      .where(eq(trips.id, tripId))
      .returning();

    await db
      .update(drivers)
      .set({ status: "available" })
      .where(eq(drivers.id, user.userId));

    // Update vehicle odometer with end odometer value
    if (trip.vehicleId !== "unassigned" && endOdometer) {
      await db
        .update(vehicles)
        .set({ odometer: endOdometer })
        .where(eq(vehicles.id, trip.vehicleId));
    }

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, user.userId));

    if (driver?.mileageAlertThreshold && driver.alertsEnabled && distance) {
      if (distance >= driver.mileageAlertThreshold) {
        await db.insert(alerts).values({
          type: "mileage",
          title: "Limite de Quilometragem Atingido",
          description: `O motorista ${driver.name} percorreu ${distance}km, ultrapassando o limite de ${driver.mileageAlertThreshold}km definido.`,
          vehicleId: trip.vehicleId !== "unassigned" ? trip.vehicleId : null,
          driverId: driver.id,
        });
      }
    }

    return c.json(updatedTrip);
  } catch (error) {
    console.error("Error completing trip:", error);
    return c.json({ error: "Erro ao finalizar viagem" }, 500);
  }
});

driverAppRoutes.patch("/trips/:id/location", async (c) => {
  try {
    const user = c.get("user");
    const tripId = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

    if (!trip || trip.driverId !== user.userId) {
      return c.json({ error: "Viagem não encontrada" }, 404);
    }

    if (trip.status !== "active") {
      return c.json({ error: "Esta viagem já foi finalizada" }, 400);
    }

    const { currentLat, currentLng } = await c.req.json();

    const [updatedTrip] = await db
      .update(trips)
      .set({ currentLat, currentLng })
      .where(eq(trips.id, tripId))
      .returning();

    if (trip.vehicleId && trip.vehicleId !== "unassigned") {
      await db
        .update(vehicles)
        .set({ lat: currentLat, lng: currentLng, status: "active" })
        .where(eq(vehicles.id, trip.vehicleId));
    }

    return c.json(updatedTrip);
  } catch (error) {
    return c.json({ error: "Erro ao atualizar localização" }, 500);
  }
});

driverAppRoutes.get("/alerts", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const alertsList = await db
      .select()
      .from(alerts)
      .where(and(eq(alerts.driverId, user.userId), eq(alerts.dismissed, false)))
      .orderBy(desc(alerts.timestamp));

    return c.json(alertsList);
  } catch (error) {
    return c.json({ error: "Erro ao buscar alertas" }, 500);
  }
});

driverAppRoutes.patch("/alerts/:id/dismiss", async (c) => {
  try {
    const user = c.get("user");
    const alertId = c.req.param("id");
    const db = createDb(c.env.DATABASE_URL);

    const [alert] = await db.select().from(alerts).where(eq(alerts.id, alertId));

    if (!alert || alert.driverId !== user.userId) {
      return c.json({ error: "Alerta não encontrado" }, 404);
    }

    await db
      .update(alerts)
      .set({ dismissed: true })
      .where(eq(alerts.id, alertId));

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Erro ao dispensar alerta" }, 500);
  }
});

driverAppRoutes.get("/vehicle", async (c) => {
  try {
    const user = c.get("user");
    const db = createDb(c.env.DATABASE_URL);

    const [driver] = await db
      .select()
      .from(drivers)
      .where(eq(drivers.id, user.userId));

    if (!driver) {
      return c.json({ error: "Motorista não encontrado" }, 404);
    }

    if (!driver.assignedVehicleId) {
      return c.json(null);
    }

    const [vehicle] = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.id, driver.assignedVehicleId));

    return c.json(vehicle || null);
  } catch (error) {
    return c.json({ error: "Erro ao buscar veículo" }, 500);
  }
});
