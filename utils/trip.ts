import { Database } from "@/database.types";
import { Place } from "@/types/place";
import { Trip, TripEvent, TripStage, TripDay, TripNight } from "@/types/trip";

export function getAllEventsOfDate(
  events: TripEvent[],
  date: Date
): TripEvent[] {
  return events.filter((event) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    return eventStart <= dayEnd && eventEnd >= dayStart;
  });
}

export function getAllEventsOfDateRange(
  events: TripEvent[],
  startDate: Date,
  endDate: Date
): TripEvent[] {
  return events.filter((event) => {
    const dayStart = new Date(startDate.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(endDate.setHours(23, 59, 59, 999)).getTime();

    const eventStart = new Date(event.start).getTime();
    const eventEnd = new Date(event.end).getTime();

    return eventStart <= dayEnd && eventEnd >= dayStart;
  });
}

export function formatTrip(
  trip: Database["public"]["Tables"]["trips"]["Row"]
): Trip {
  return {
    id: trip.id,
    name: trip.name,
    thumbnail: trip.thumbnail,
    createdAt: new Date(trip.created_at),
    creatorId: trip.creator_id,
    departureDate: new Date(trip.departure_date),
    returnDate: new Date(trip.return_date),
  };
}

export function formatTripStage(
  stage: Database["public"]["Tables"]["trip_stages"]["Row"]
): TripStage {
  return {
    id: stage.id,
    createdAt: new Date(stage.created_at),
    name: stage.name,
    thumbnail: stage.thumbnail,
    tripId: stage.trip_id,
    startDate: new Date(stage.start_date),
    endDate: new Date(stage.end_date),
  };
}

export function formatTripDay(
  day: Database["public"]["Tables"]["trip_days"]["Row"]
): TripDay {
  return {
    id: day.id,
    createdAt: new Date(day.created_at),
    tripId: day.trip_id,
    name: day.name,
    stageId: day.stage_id,
    date: new Date(day.date),
    longitude: day.longitude,
    latitude: day.latitude,
  };
}

type NightInput = Database["public"]["Tables"]["trip_nights"]["Row"] & {
  name: string;
  longitude: number;
  latitude: number;
};

export function formatTripNight(night: NightInput): TripNight {
  return {
    id: night.id,
    createdAt: new Date(night.created_at),
    startDate: new Date(night.start_date),
    endDate: new Date(night.end_date),
    stageId: night.stage_id,
    name: night.name,
    longitude: night.longitude,
    latitude: night.latitude,
  };
}

type TripEventInput = Database["public"]["Tables"]["trip_events"]["Row"] & {
  place?: Database["public"]["Tables"]["places"]["Row"] & {
    name: string;
    category: Place["category"];
  };
  transport?: Database["public"]["Tables"]["trip_transports"]["Row"];
};

export function formatTripEvent(event: TripEventInput): TripEvent | undefined {
  if (event.type === "activity" && event.place) {
    return {
      id: event.id,
      start: new Date(event.start),
      end: new Date(event.end),
      type: "activity",
      place: {
        id: event.place.id,
        category: event.place.category,
        longitude: event.place.longitude,
        latitude: event.place.latitude,
        thumbnail: event.place.thumbnail,
        name: event.place.name,
      },
    };
  } else if (event.type === "transport" && event.transport) {
    console.log("event.transport", event.transport);
    return {
      id: event.id,
      start: new Date(event.start),
      end: new Date(event.end),
      type: "transport",
      transport: {
        id: event.transport.id,
        duration: event.transport.duration,
        length: event.transport.length,
        departureCoordinates: event.transport.departure_coordinates,
        arrivalCoordinates: event.transport.arrival_coordinates,
      },
    };
  } else if (event.type === "night" && event.place) {
    return {
      id: event.id,
      start: new Date(event.start),
      end: new Date(event.end),
      type: "night",
      place: {
        id: event.place.id,
        category: event.place.category,
        longitude: event.place.longitude,
        latitude: event.place.latitude,
        thumbnail: event.place.thumbnail,
        name: event.place.name,
      },
    };
  } else {
    return undefined;
  }
}
