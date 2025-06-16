export type TransportType = 'walk' | 'bus' | 'metro';

export interface Station {
  station_id: string;       // e.g. "36.879,10.183"
  name: string;
  lat: number;
  lng: number;
  type: TransportType;
}

export interface Connection {
  stationKey: string;
  type: TransportType;
  line?: string;
  duration: number;  // in minutes
  distance: number;  // in kilometers or meters, consistent unit
}

export interface RouteSegment {
  from: Station;
  to: Station;
  mode: TransportType;
  line?: string;
  duration: number;      // minutes
  distance: number;      // km
  instructions: string;
}

export interface RouteOption {
  segments: RouteSegment[];
  total_duration: number;  // minutes
  total_distance: number;  // km
  transfers: number;
}
