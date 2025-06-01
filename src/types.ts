// Type definitions for the Trander application

export interface GeoapifyPlace {
  type: 'Feature';
  properties: PlaceProperties;
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface PlaceProperties {
  place_id: string;
  name?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
  categories?: string[];
  opening_hours?: string;
  website?: string;
  image?: string;
  photo?: string;
  // Enhanced details from Geoapify API
  phone?: string;
  email?: string;
  rating?: number;
  price_level?: string;
  wheelchair?: string;
  internet_access?: string;
  smoking?: string;
  outdoor_seating?: string;
  cuisine?: string;
  brand?: string;
  operator?: string;
  description?: string;
}

export interface GeoapifyResponse {
  type: 'FeatureCollection';
  features: GeoapifyPlace[];
}

export interface FavoritePlace {
  place_id: string;
  name: string;
  address: string;
}

export interface Position {
  coords: {
    latitude: number;
    longitude: number;
  };
}

export interface IPLocationResponse {
  latitude: number;
  longitude: number;
}

export interface CategoryDefinition {
  [key: string]: string;
}

export type CategoryKey = keyof CategoryDefinition;

// GeoDB Cities API types
export interface GeoDBCity {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  region?: string;
  regionCode?: string;
}

export interface GeoDBSearchResponse {
  data: GeoDBCity[];
  metadata: {
    currentOffset: number;
    totalCount: number;
  };
}

export interface Country {
  code: string;
  name: string;
}

export interface WorldLocationData {
  city: GeoDBCity;
  places: GeoapifyPlace[];
}