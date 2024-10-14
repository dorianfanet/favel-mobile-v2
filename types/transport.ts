export interface Transport {
  id: string;
  duration: number;
  length: number;
  departureCoordinates: {
    lat: number;
    lng: number;
  };
  arrivalCoordinates: {
    lat: number;
    lng: number;
  };
  modes: TransportMode[];
  departureEventId: string;
  arrivalEventId: string;
}

export type TransportMode = "pedestrian" | "kickScooter";
