// Mapeamento de localizações em Angola para coordenadas
export const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  // Luanda
  "luanda": { lat: -8.8383, lng: 13.2344 },
  
  // Benguela Province (southwest)
  "dombe grande": { lat: -12.3840, lng: 13.5850 },
  "baía farta": { lat: -12.5180, lng: 13.6210 },
  "benguela": { lat: -12.5764, lng: 13.4084 },
  
  // Bié Province (central-east)
  "camacupa": { lat: -8.9450, lng: 16.0850 },
  "ringoma": { lat: -8.8250, lng: 16.2450 },
  "kuito": { lat: -8.8667, lng: 16.9500 },
  
  // Cuando Cubango (southeast)
  "centro": { lat: -17.7719, lng: 21.7553 },
  "cuangar": { lat: -17.8000, lng: 20.5000 },
  
  // Cabinda (north)
  "buco-zau": { lat: -5.3667, lng: 24.0833 },
  "cabinda": { lat: -5.5500, lng: 24.1500 },
  
  // Cuanza Norte (north-central)
  "lucala": { lat: -9.6500, lng: 15.1833 },
  
  // Bié (Catabola region)
  "chipeta": { lat: -9.0750, lng: 15.8250 },
  "catabola": { lat: -8.8500, lng: 15.9000 },
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
