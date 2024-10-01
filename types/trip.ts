export interface Trip {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  departureDate: Date;
  returnDate: Date;
  creatorId: string;
  thumbnail: string;
}

export interface TripStage {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  thumbnail: string;
  tripId: string;
  startDate: Date;
  endDate: Date;
}

export interface TripDay {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tripId: string;
  name: string;
  centerPoint: any; // Replace 'any' with a more specific type if possible
  areaPolygon: any; // Replace 'any' with a more specific type if possible
  stageId: string;
  date: Date;
}

export interface TripNight {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
  stageId: string;
  name: string;
  centerPoint: any; // Replace 'any' with a more specific type if possible
}

export type TripEvent = TripEventActivity;

export interface BaseTripEvent {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  dayId: string;
  start: Date;
  end: Date;
  centerPoint: any; // Replace 'any' with a more specific type if possible
}

export interface TripEventActivity extends BaseTripEvent {
  name: string;
  location: string;
  thumbnail: string;
}
