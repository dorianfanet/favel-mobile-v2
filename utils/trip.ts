import { TripEvent } from "@/types/trip";

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
