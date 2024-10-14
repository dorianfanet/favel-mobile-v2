import { intervalToDuration } from "date-fns";

export function formatSeconds(seconds: number) {
  const duration = intervalToDuration({ start: 0, end: seconds * 1000 });
  return {
    minutes: duration.minutes || 0,
    seconds: duration.seconds || 0,
  };
}
