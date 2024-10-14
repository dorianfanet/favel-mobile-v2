// utils.ts
import {
  Feature,
  Point,
  Polygon,
  Properties,
  booleanPointInPolygon,
  buffer,
  center,
  clustersDbscan,
  convex,
  distance,
  featureCollection,
  point,
  Position,
  FeatureCollection,
  concave,
  lineString,
  LineString,
} from "@turf/turf";
import { MapTripDay } from "@/types/map";
import { TripDay, TripEvent, TripEventActivity } from "@/types/trip";
import { TripState } from "@/context/tripContext";
import { getAllEventsOfDate, getAllEventsOfDateRange } from "./trip";

export function createOgGeojsonDays(days: TripDay[]) {
  return featureCollection(
    days.map((day) =>
      point<MapTripDay>([day.longitude, day.latitude], {
        id: day.id,
        name: day.name,
        centerPoint: {
          lat: day.latitude,
          lng: day.longitude,
        },
        dayIds: [day.id],
        dates: [day.date],
      })
    )
  );
}

export async function clusterDays(
  ogGeojsonDays: FeatureCollection<Point, MapTripDay>,
  bounds: [Position, Position],
  stateDays: TripDay[]
) {
  const sw = [bounds[0][0], bounds[0][1]];
  const se = [bounds[1][0], bounds[0][1]];

  const mapWidth = distance(sw, se, { units: "kilometers" });

  const clustered = clustersDbscan(ogGeojsonDays, mapWidth / 4, {
    units: "kilometers",
  });

  const clusters: { [key: string]: string[] } = {};
  const noisePoints: string[] = [];

  clustered.features.forEach((feature) => {
    if (feature.properties.cluster !== undefined) {
      const clusterId = feature.properties.cluster;
      if (!clusters[clusterId]) {
        clusters[clusterId] = feature.properties.dayIds;
      } else {
        clusters[clusterId].push(...feature.properties.dayIds);
      }
    } else {
      noisePoints.push(feature.properties.id);
    }
  });

  const clusterPoints: Feature<Point, MapTripDay>[] = Object.keys(clusters).map(
    (key) => {
      const cluster = clusters[key];
      const points = cluster.map((dayId) => {
        const day = stateDays.find((d) => d.id === dayId)!;
        return point([day.longitude, day.latitude], {
          id: dayId,
          name: day.name,
          centerPoint: {
            lat: day.latitude,
            lng: day.longitude,
          },
          dayIds: [dayId],
          dates: [day.date],
        });
      });

      const centerPoint = center(featureCollection(points));
      return point(centerPoint.geometry.coordinates, {
        id: `cluster-${key}`,
        centerPoint: {
          lat: centerPoint.geometry.coordinates[1],
          lng: centerPoint.geometry.coordinates[0],
        },
        dayIds: cluster,
        dates: groupConsecutiveDates(
          cluster.map((dayId) => {
            const day = stateDays.find((d) => d.id === dayId)!;
            return day.date;
          })
        ),
      });
    }
  );

  const noisePointsFeatures: Feature<Point, MapTripDay>[] = noisePoints.map(
    (dayId) => {
      const day = stateDays.find((d) => d.id === dayId)!;
      return point([day.longitude, day.latitude], {
        id: dayId,
        name: day.name,
        centerPoint: {
          lat: day.latitude,
          lng: day.longitude,
        },
        dayIds: [dayId],
        dates: [day.date],
      });
    }
  );

  return clusterPoints.concat(noisePointsFeatures);
}

export function createDayPolygons(
  days: Feature<Point, MapTripDay>[],
  state: TripState
) {
  const convexs: (
    | Feature<Polygon, Properties>
    | Feature<Point, Properties>
    | Feature<LineString, Properties>
    | null
  )[] = days.map((day) => {
    const days = day.properties.dates.map((date) => {
      if (Array.isArray(date)) {
        return getAllEventsOfDateRange(state.events, date[0], date[1]);
      } else {
        return getAllEventsOfDate(state.events, date);
      }
    });

    const dayEvents = days.flat().filter((event) => event.type === "activity");

    if (dayEvents.length === 0) {
      return null;
    }

    if (dayEvents.length > 2) {
      return convex({
        type: "Feature",
        properties: {},
        geometry: {
          type: "MultiPoint",
          coordinates: dayEvents.map((event: TripEventActivity) => [
            event.place.longitude,
            event.place.latitude,
          ]),
        },
      });
    } else if (dayEvents.length === 2) {
      return lineString([
        [dayEvents[0].place.longitude, dayEvents[0].place.latitude],
        [dayEvents[1].place.longitude, dayEvents[1].place.latitude],
      ]);
    } else {
      return point([dayEvents[0].place.longitude, dayEvents[0].place.latitude]);
    }
  });

  // if all convexs are null, return an empty feature collection
  if (convexs.every((convex) => convex === null)) {
    return featureCollection([]);
  }

  const bufferedPolygons = convexs.map((polygon) => {
    return buffer(polygon!, 0.5, { units: "kilometers" });
  });

  return featureCollection(bufferedPolygons);
}

export function getTextWidth(text: string, fontSize: number) {
  const fontWidth = text.length * fontSize;

  if (fontWidth > 250) {
    return text.slice(0, 18) + "...";
  } else {
    return text;
  }
}

export function groupConsecutiveDates(arr: Date[]): (Date | [Date, Date])[] {
  if (arr.length === 0) return [];

  // Sort the dates in ascending order
  arr.sort((a, b) => a.getTime() - b.getTime());

  const result: (Date | [Date, Date])[] = [];
  let group: Date[] = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    const prevDate = arr[i - 1];
    const currDate = arr[i];

    // Calculate the difference in days between two dates
    const dayDifference =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      // If the difference is exactly one day, it's consecutive
      group.push(currDate);
    } else {
      // If not consecutive, add the group to the result
      if (group.length > 1) {
        result.push([group[0], group[group.length - 1]]);
      } else {
        result.push(group[0]);
      }
      // Start a new group with the current date
      group = [currDate];
    }
  }

  // Handle the last group
  if (group.length > 1) {
    result.push([group[0], group[group.length - 1]]);
  } else {
    result.push(group[0]);
  }

  return result;
}
