// Geocoding service using OpenStreetMap Nominatim (free, no API key required)
// Alternative: Can use Google Geocoding API, Mapbox, etc.

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export const geocodingService = {
  /**
   * Geocode an address to get latitude and longitude
   * @param address - Full address string (e.g., "123 Main St, Los Angeles, CA 90001")
   * @returns Coordinates and formatted address
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      // Construct the full address string
      const encodedAddress = encodeURIComponent(address);
      
      // Use OpenStreetMap Nominatim API (free, no API key needed)
      // Rate limit: 1 request per second
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        {
          headers: {
            'User-Agent': 'Ethiopian-Orthodox-Church-Finder' // Required by Nominatim
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error('Address not found. Please check the address and try again.');
      }

      const result = data[0];
      
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name || address,
      };
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error('Failed to geocode address. Please try again.');
    }
  },

  /**
   * Geocode address components separately
   * @param address - Street address
   * @param city - City name
   * @param state - State abbreviation
   * @param zip - ZIP code
   * @returns Coordinates and formatted address
   */
  async geocodeAddressComponents(
    address: string,
    city: string,
    state: string,
    zip: string
  ): Promise<GeocodingResult> {
    // Construct full address string
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    return this.geocodeAddress(fullAddress);
  },
};
