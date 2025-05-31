/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEOAPIFY_API_KEY: string
  readonly VITE_GEODB_CITIES_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}