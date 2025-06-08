/// <reference types="vite/client" />

type ImportMetaEnv = {
  readonly VITE_GOOGLE_PLACES_API_KEY: string;
  readonly VITE_GEODB_CITIES_API_KEY: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

