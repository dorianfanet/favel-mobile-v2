import { Feature, LineString, Properties } from "@turf/turf";
import { JsonCoordinates } from "./types";

export interface Transport {
  id: string;
  duration: number;
  length: number;
  departureCoordinates: JsonCoordinates;
  arrivalCoordinates: JsonCoordinates;
  modes: TransportMode[];
  departureEventId: string;
  arrivalEventId: string;
}

export type TransportMode = "pedestrian" | "kickScooter";

export interface TransportSection {
  id: string;
  duration: number;
  length: number;
  mode: TransportMode;
  sectionIndex: number;
  departureTime: Date;
  arrivalTime: Date;
  departure: JsonCoordinates;
  arrival: JsonCoordinates;
  polyline: Feature<LineString, Properties>;
  color?: string;
}
