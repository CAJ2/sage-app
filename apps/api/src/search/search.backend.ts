export enum SearchIndex {
  CATEGORIES = 'categories',
  ITEMS = 'items',
  VARIANTS = 'variants',
  COMPONENTS = 'components',
  MATERIALS = 'materials',
  PLACES = 'places',
  ORGS = 'orgs',
  REGIONS = 'regions',
}

export type SearchBackendFilter =
  | {
      type: 'field'
      field: string
      operator: '='
      value: string | number | boolean
    }
  | {
      type: 'raw'
      expression: string
    }

export type SearchBackendGeoFilter =
  | {
      type: 'radius'
      latitude: number
      longitude: number
      distanceMeters: number
    }
  | {
      type: 'boundingBox'
      topLeft: {
        latitude: number
        longitude: number
      }
      bottomRight: {
        latitude: number
        longitude: number
      }
    }

export interface SearchBackendSearchOptions {
  limit?: number
  offset?: number
  filters?: SearchBackendFilter[]
  geo?: SearchBackendGeoFilter
  lang?: string
  vector?: number[]
}

export interface SearchBackendSearchRequest {
  collection: string
  query: string
  options?: SearchBackendSearchOptions
}

export interface SearchBackendHit {
  id: string
  sourceCollection: string
  score: number
  geo?: {
    latitude: number
    longitude: number
  }
}

export interface SearchBackendSearchResult {
  hits: SearchBackendHit[]
  found: number
}

export interface SearchBackendMultiSearchRequest {
  searches: SearchBackendSearchRequest[]
}

export interface SearchBackendMultiSearchResult {
  results: SearchBackendSearchResult[]
}

export interface SearchBackend {
  listCollections(): Promise<string[]>
  search(request: SearchBackendSearchRequest): Promise<SearchBackendSearchResult>
  multiSearch(request: SearchBackendMultiSearchRequest): Promise<SearchBackendMultiSearchResult>
  supportsVectorSearch(collection: string): Promise<boolean>
}

export const SEARCH_BACKEND = Symbol('SEARCH_BACKEND')
