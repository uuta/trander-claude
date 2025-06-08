// Type definitions for the Trander application

// Google Places API types
export type GooglePlace = {
  place_id: string;
  name?: string;
  vicinity?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  price_level?: number; // 0-4 scale
  types?: string[];
  photos?: Array<{
    photo_reference: string;
    height: number;
    width: number;
  }>;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  // Additional fields from Place Details API if needed
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  business_status?: string;
  wheelchair_accessible_entrance?: boolean;
  editorial_summary?: {
    overview?: string;
  };
};

export type GooglePlacesResponse = {
  results: GooglePlace[];
  status: string;
  error_message?: string;
  next_page_token?: string;
};

export type FavoritePlace = {
  place_id: string;
  name: string;
  address: string;
};

export type Position = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

export type IPLocationResponse = {
  latitude: number;
  longitude: number;
};

export type CategoryDefinition = {
  [key: string]: string;
};

export type CategoryKey = keyof CategoryDefinition;

// GeoDB Cities API types
export type GeoDBCity = {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  population: number;
  region?: string;
  regionCode?: string;
};

export type GeoDBSearchResponse = {
  data: GeoDBCity[];
  metadata: {
    currentOffset: number;
    totalCount: number;
  };
};

export type Country = {
  code: string;
  name: string;
};

export type WorldLocationData = {
  city: GeoDBCity;
  places: GooglePlace[];
};