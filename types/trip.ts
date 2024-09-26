export interface TripDay {
  id: string;
  date: Date;
  tripId: string;
  name: string;
  centerPoint: {
    latitude: number;
    longitude: number;
  };
  areaPolygon?: {
    latitude: number;
    longitude: number;
  }[];
}

export interface TripEvent {
  id: string;
  start: Date;
  end: Date;
  dayId: string;
  title: string;
}
