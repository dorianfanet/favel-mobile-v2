import { MMKV } from "@/app/(auth)/trip/_layout";
import { favel } from "./favelApi";

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
  return `Le ${day}/${month}/${year} à ${hour}h${minute}`;
}

export async function getUserMetadata(userId: string) {
  const cachedUser = await MMKV.getStringAsync(`user-${userId}`);

  if (cachedUser) {
    return JSON.parse(cachedUser).data;
  } else {
    const response = await favel.getUser(userId);
    const data = {
      id: response.id,
      firstName: response.firstName,
      lastName: response.lastName,
      imageUrl: response.imageUrl,
      publicMetadata: response.publicMetadata,
    };

    MMKV.setStringAsync(
      `user-${userId}`,
      JSON.stringify({
        data: data,
        expiresAt: new Date().getTime() + 7200000,
      })
    );

    return data;
  }
}
