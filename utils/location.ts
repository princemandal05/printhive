/**
 * Calculates the great-circle distance between two geographic points
 * using the Haversine formula.
 * @returns distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's mean radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Formats numeric distance into a human-readable string.
 * e.g. 0.8 -> "800 m", 2.45 -> "2.5 km"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }
  return `${distanceKm.toFixed(1)} km`
}

/**
 * Sorts array of printer locations by distance from a given user location.
 */
export function sortPrintersByDistance<T extends { lat: number; lng: number }>(
  printers: T[],
  userLat: number,
  userLng: number
): (T & { calculatedDistanceKm: number; formattedDistance: string })[] {
  return printers
    .map((printer) => {
      const dist = calculateHaversineDistance(userLat, userLng, printer.lat, printer.lng)
      return {
        ...printer,
        calculatedDistanceKm: dist,
        formattedDistance: formatDistance(dist),
      }
    })
    .sort((a, b) => a.calculatedDistanceKm - b.calculatedDistanceKm)
}
