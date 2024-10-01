import React, { useMemo } from "react";
import Mapbox from "@rnmapbox/maps";
import { Feature, Point } from "@turf/turf";
import { MapTripDay } from "@/types/map";
import { createDayPolygons } from "@/utils/map";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";

interface DayPolygonsProps {
  days: Feature<Point, MapTripDay>[];
  state: any; // Replace 'any' with the actual type of your state
}

export default function DayPolygons({ days, state }: DayPolygonsProps) {
  const { theme } = useTheme();

  const dayPolygons = useMemo(
    () => createDayPolygons(days, state),
    [days, state]
  );

  return (
    <Mapbox.ShapeSource
      id="dayPolygons"
      shape={dayPolygons}
    >
      <Mapbox.FillLayer
        id="dayPolygons"
        style={{
          fillColor: Colors[theme].accent,
          fillOpacity: 0.2,
        }}
      />
      <Mapbox.LineLayer
        id="dayPolygonsOutline"
        style={{
          lineColor: Colors[theme].accent,
          lineWidth: 2,
        }}
      />
    </Mapbox.ShapeSource>
  );
}
