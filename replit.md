# FleetTrack - Fleet Management System

## Overview

FleetTrack is a comprehensive fleet management platform for vehicle tracking, driver management, maintenance scheduling, and real-time GPS monitoring. The application is built as a full-stack TypeScript application with a React frontend and Express backend, using PostgreSQL for data persistence. The system targets enterprise fleet operations with features for tracking vehicles in real-time on maps, managing driver assignments, scheduling maintenance, logging trips, and handling alerts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Maps**: Leaflet for real-time fleet map visualization
- **Build Tool**: Vite with HMR support

The frontend follows a page-based structure with reusable fleet-specific components (VehicleCard, DriverCard, FleetMap, AlertItem, etc.) in `client/src/components/fleet/`. Generic UI components from shadcn/ui are in `client/src/components/ui/`.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Driver**: Neon serverless PostgreSQL client
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage
- **Authentication**: Replit Auth integration with OpenID Connect and Passport.js

The backend uses a storage pattern (`server/storage.ts`) that abstracts all database operations, making it easy to swap implementations. Routes are registered in `server/routes.ts` with REST API endpoints for vehicles, drivers, trips, maintenance records, and alerts.

### Data Models
Core entities defined in `shared/schema.ts`:
- **Users**: Authentication and user management
- **Vehicles**: Fleet vehicles with status, location, fuel level, odometer
- **Drivers**: Driver information with license expiry tracking
- **Trips**: Trip logs with start/end locations, times, and distance
- **Maintenance**: Scheduled and completed maintenance records
- **Alerts**: System alerts for maintenance, documents, fuel, and speed violations

### Design System
The application follows Material Design principles adapted for enterprise fleet management, emphasizing:
- Information density for dashboard views
- Clean data presentation with status indicators
- Inter font family for readability
- Consistent spacing using Tailwind's utility classes

## External Dependencies

### Database
- **PostgreSQL**: Primary database via Neon serverless (`@neondatabase/serverless`)
- **Drizzle ORM**: Schema definition and query building
- Database URL configured via `DATABASE_URL` environment variable

### Authentication
- **Replit Auth**: OpenID Connect integration for user authentication
- **Passport.js**: Authentication middleware with session support
- Session secret configured via `SESSION_SECRET` environment variable

### Mapping
- **Leaflet**: Interactive maps for vehicle tracking
- OpenStreetMap tiles for map rendering

### Third-Party Libraries
- **date-fns**: Date formatting and manipulation (with Portuguese locale support)
- **Zod**: Runtime schema validation for API inputs
- **TanStack React Query**: Data fetching and caching

### Development Tools
- **Vite**: Frontend build and development server
- **esbuild**: Production server bundling
- **drizzle-kit**: Database migrations and schema management