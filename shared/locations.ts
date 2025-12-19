// Mapeamento de localizações em Angola para coordenadas
export const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  // Luanda
  "luanda": { lat: -8.8383, lng: 13.2344 },
  
  // Benguela Province
  "dombe grande": { lat: -12.3824, lng: 13.5854 },
  "baía farta": { lat: -12.9238, lng: 13.3584 },
  "benguela": { lat: -12.5764, lng: 13.4084 },
  
  // Bié Province  
  "camacupa": { lat: -8.9011, lng: 13.3511 },
  "ringoma": { lat: -8.9, lng: 13.35 },
  "kuito": { lat: -8.8667, lng: 16.95 },
  
  // Cuando Cubango
  "centro": { lat: -17.7719, lng: 21.7553 },
  "cuangar": { lat: -17.8, lng: 20.5 },
  
  // Cabinda
  "buco-zau": { lat: -5.5, lng: 24.0 },
  
  // Cuanza Norte
  "lucala": { lat: -7.5, lng: 15.0 },
  
  // Catabola
  "chipeta": { lat: -8.5, lng: 16.5 },
  "catabola": { lat: -8.2, lng: 16.2 },
};

export function extractCoordinatesFromLocation(location: string): { lat: number; lng: number } | null {
  if (!location) return null;
  
  const normalizedLocation = location.toLowerCase();
  
  // Tentar encontrar correspondência exata
  for (const [key, coords] of Object.entries(locationCoordinates)) {
    if (normalizedLocation.includes(key)) {
      return coords;
    }
  }
  
  // Se não encontrar, retornar null
  return null;
}
