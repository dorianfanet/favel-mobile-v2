import { TripEvent } from "@/types/trip";
import {
  FeatureCollection,
  Lines,
  lineString,
  LineString,
  Point,
} from "@turf/turf";
import React, { useMemo } from "react";

interface DayLinesProps {
  selectedDay: string;
  selectedEvents: FeatureCollection<Point, TripEvent>;
}

function DayLines({ selectedDay, selectedEvents }: DayLinesProps) {
  // const dayLines: FeatureCollection<LineString> = useMemo(() => {
  //   const lines: LineString[] = [];
  //   selectedEvents.features.forEach((event) => {
  //     lines.push(lineString(
  //       [
  //         [event.geometry.coordinates[0], event.geometry.coordinates[1]],
  //         [event.geometry.coordinates[0], event.geometry.coordinates[1]],
  //       ],
  //       event.properties
  //     ))
  //   });
  // }, [selectedEvents]);

  return <></>;
}

export default React.memo(DayLines);
