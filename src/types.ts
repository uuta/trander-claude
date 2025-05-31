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