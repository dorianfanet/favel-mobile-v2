import { MMKV } from "@/app/(auth)/trip/_layout";
import { favel } from "./favelApi";
import { BBox, Position, bbox, center, lineString, points } from "@turf/turf";
import { Day, UserMetadata } from "@/types/types";

export function formatTimestamps(startTimestamp: string, endTimestamp: string) {
  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  // Parse timestamps into Date objects
  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);

  // Extract day and month
  const startDay = startDate.getDate();
  const startMonth = monthNames[startDate.getMonth()];
  const endDay = endDate.getDate();
  const endMonth = monthNames[endDate.getMonth()];

  // Check if months are the same and format accordingly
  if (startDate.getMonth() === endDate.getMonth()) {
    return `Du ${startDay} au ${endDay} ${endMonth}`;
  } else {
    return `Du ${startDay} ${startMonth} au ${endDay} ${endMonth}`;
  }
}

export function getDaysDiff(startTimestamp: Date, endTimestamp: Date) {
  const diffTime = Math.abs(
    new Date(startTimestamp).getTime() - new Date(endTimestamp).getTime()
  );
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatHoursToHoursAndMinutes(hours: number): string {
  // Separate the hours and the fractional part
  const wholeHours = Math.floor(hours);
  const fractionalHours = hours - wholeHours;

  // Convert the fractional part into minutes
  const minutes = Math.round(fractionalHours * 60);

  // Check if there are whole hours and minutes
  if (wholeHours > 0 && minutes > 0) {
    return `${wholeHours} h ${minutes} min`;
  } else if (wholeHours > 0) {
    // Only whole hours, no minutes
    return `${wholeHours} h`;
  } else {
    // Less than 1 hour, only minutes
    return `${minutes} min`;
  }
}

export function secondsToHoursMinutes(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours} h ${minutes} min`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatTimestamp(timestamp: string): string {
  // Parse the timestamp and create a Date object
  const date = new Date(timestamp);

  // Extract components of the date
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  // Format the date in the desired format
  return `${day}/${month}/${year} à ${hour}h${minute}`;
}

export function getUserMetadataFromCache(userId: string): UserMetadata | null {
  const userMetadata = MMKV.getString(`user-${userId}`);

  if (userMetadata) {
    return JSON.parse(userMetadata);
  } else {
    return null;
  }
}

export async function getUserMetadata(userId: string, forceRefresh = false) {
  if (forceRefresh) {
    MMKV.removeItem(`user-${userId}`);
  }

  const cachedUser = await MMKV.getStringAsync(`user-${userId}`);
  const cachedUserParsed = JSON.parse(cachedUser || "{}");

  if (
    cachedUserParsed &&
    cachedUserParsed.data &&
    cachedUserParsed.expiresAt > new Date().getTime()
  ) {
    return cachedUserParsed.data;
  } else {
    const response = await favel.getUser(userId);
    console.log(response);

    if (response) {
      const data = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        imageUrl: response.imageUrl,
        createdAt: response.createdAt,
        publicMetadata: response.publicMetadata,
      };

      MMKV.setStringAsync(
        `user-${userId}`,
        JSON.stringify({
          data: data,
          expiresAt: new Date().getTime() + 720000,
        })
      );

      return data;
    } else {
      return {};
    }
  }
}

export function bboxToCoordinatesArray(bbox: BBox) {
  const [minLongitude, minLatitude, maxLongitude, maxLatitude] = bbox;

  const corners = [
    { longitude: minLongitude, latitude: minLatitude }, // Southwest corner
    { longitude: maxLongitude, latitude: minLatitude }, // Southeast corner
    { longitude: maxLongitude, latitude: maxLatitude }, // Northeast corner
    { longitude: minLongitude, latitude: maxLatitude }, // Northwest corner
  ];

  return corners;
}

export function getBoundsOfDay(activities: Day["activities"]) {
  console.log(activities);
  const noRouteActivities = activities?.filter(
    (activity) => activity.type !== "route"
  );

  const pointsOfDay: Position[] = [];

  if (!noRouteActivities) return undefined;

  noRouteActivities.map((activity) => {
    if (activity.coordinates) {
      pointsOfDay.push([
        activity.coordinates.longitude,
        activity.coordinates.latitude,
      ]);
    }
  });

  const line = lineString(pointsOfDay);
  const bounds = bbox(line);

  return bounds;
}

export function formatDateToRelative(timestamp: string | number): string {
  try {
    const now = new Date();
    console.log(timestamp);
    const date = new Date(
      typeof timestamp === "string" ? timestamp : timestamp * 1000
    );
    console.log(date);
    const formatter = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const time = formatter.format(date);

    // Resetting hours, minutes, and seconds for comparison
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const today = now.getTime();
    const yesterday = new Date(now.setDate(now.getDate() - 1)).getTime();
    const dateDay = date.getTime();

    if (dateDay === today) {
      return `Aujourd'hui à ${time}`;
    } else if (dateDay === yesterday) {
      return `Hier à ${time}`;
    } else {
      const fullDateFormatter = new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
      });
      const fullDate = fullDateFormatter.format(date);
      return `Le ${fullDate} à ${time}`;
    }
  } catch (error) {
    console.error(error);
    return "";
  }
}

export function formatDateToRelativeShort(timestamp: string | number): string {
  try {
    const now = new Date();
    const date = new Date(
      typeof timestamp === "string" ? timestamp : timestamp * 1000
    );
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`; // Seconds
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}min`; // Minutes
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`; // Hours
    } else {
      return `${Math.floor(diffInSeconds / 86400)}j`; // Days
    }
  } catch (error) {
    console.error(error);
    return "";
  }
}

export function getTripMetadataFromCache(id: string) {
  const tripMetadata = MMKV.getString(`trip-metadata-${id}`);

  if (tripMetadata) {
    return JSON.parse(tripMetadata);
  } else {
    return null;
  }
}
