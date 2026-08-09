# 🗺️ PrintHive Location & Mapping System Documentation

## Overview

PrintHive uses an open-source, cost-effective real-world location system for matching buyers with nearby 3D printer owners across India.

---

## 🛠️ Technology Stack

1. **Mapping Engine**: [Leaflet.js](https://leafletjs.com/) (v1.9.4)
2. **Tile Provider**: Standard [OpenStreetMap](https://www.openstreetmap.org/) Tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`)
3. **Attribution**: Full legal copyright attribution (`© OpenStreetMap contributors`)
4. **Geolocation API**: Native Browser `navigator.geolocation` API
5. **Database Storage**: PostgreSQL via Supabase (`public.printers` table)

> 🚫 **No Paid Services**: Zero reliance on Google Maps, Mappls, Mapbox, or paid geocoding APIs.

---

## 📍 Core Features & Capabilities

### 1. Interactive OpenStreetMap Canvas
* **India Bounds Guarding**: Bounded to strict India geographic bounds ($\text{Lat: } 6.5^\circ \text{ to } 35.5^\circ, \text{ Lng: } 68.0^\circ \text{ to } 97.5^\circ$).
* **Touch & Mouse Interaction**: Smooth zoom, pan, marker click popups, and custom SVG markers.

### 2. Location Picker Mode (`isPicker = true`)
* **Draggable Pin Marker**: Renders a custom draggable pin (`draggable: true`) with a `dragend` listener.
* **Map Click Listener**: Clicking anywhere on the map updates selected latitude and longitude coordinates.
* **Coordinate Precision**: Lat/Lng rounded to 5 decimal places for accuracy ($\approx 1.1 \text{ m}$ resolution).

### 3. Native Geolocation & Error Handling
* **Location Button**: Integrated `"Use My Location"` control button.
* **Permission & Error States**:
  * `PERMISSION_DENIED`: Displays user toast `"⚠️ Location access denied. Click on map to set position manually."`
  * `POSITION_UNAVAILABLE` / `TIMEOUT`: Warns user and preserves manual pin picker mode.
* **Locating Spinner**: Displays live `isLocating` state while fetching GPS position.

### 4. Distance Calculation & Proximity Sorting
* **Haversine Formula**: Calculates great-circle distance between buyer/user coordinates and printer hubs:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
* **Formatted Output**: Displays distances dynamically in meters ($< 1 \text{ km}$) or kilometers ($\ge 1 \text{ km}$).
* **Proximity Sorting**: Automatically orders verified printer hubs from closest to furthest.

---

## 🗄️ Database Integration (Supabase)

Printer hub coordinates and address details are stored in the PostgreSQL `public.printers` table:

```sql
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.printers ADD COLUMN IF NOT EXISTS address TEXT;
```

---

## 📂 Key Source Code Locations

* [components/OpenStreetMap.tsx](../components/OpenStreetMap.tsx) — Main Leaflet/OpenStreetMap wrapper component.
* [utils/location.ts](../utils/location.ts) — Haversine distance calculator & sorting helpers.
* [RegisterPrinterForm.tsx](../app/dashboard/printer-owner/register/RegisterPrinterForm.tsx) — Printer registration & location picker form.
* [app/printers/page.tsx](../app/printers/page.tsx) — Directory list with map pins & distance sorting.
