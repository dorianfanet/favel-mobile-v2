import { Place } from "./place";

export interface Trip {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  name: string;
  departureDate: Date;
  returnDate: Date;
  creatorId: string;
  thumbnail: string;
}

export interface TripStage {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  name: string;
  thumbnail?: string | null;
  tripId: string;
  startDate: Date;
  endDate: Date;
}

export interface TripDay {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  tripId: string;
  name: string;
  areaPolygon?: any; // Replace 'any' with a more specific type if possible
  stageId: string;
  date: Date;
  longitude: number;
  latitude: number;
}

export interface TripNight {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
  startDate: Date;
  endDate: Date;
  stageId: string;
  name: string;
  longitude: number;
  latitude: number;
}

export type TripEvent = TripEventActivity | TripEventTransport;

export interface BaseTripEvent {
  id: string;
  start: Date;
  end: Date;
}

export interface TripEventActivity extends BaseTripEvent {
  type: "activity";
  place: Place;
}

export interface TripEventTransport extends BaseTripEvent {
  type: "transport";
}

// export type TripEvent = TripEventActivity;

// export interface BaseTripEvent {
//   id: string;
//   createdAt: Date;
//   updatedAt: Date;
//   dayId: string;
//   start: Date;
//   end: Date;
// }

// export interface TripEventActivity extends BaseTripEvent {
//   type: "activity";
//   centerPoint: any; // Replace 'any' with a more specific type if possible
//   name: string;
//   location: string;
//   thumbnail: string;
// }

// export interface TripEventTransport extends BaseTripEvent {
//   type: "transport";
// }
