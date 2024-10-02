import React, { useMemo } from "react";
import Mapbox from "@rnmapbox/maps";
import { MapTripDay } from "@/types/map";
import { createDayPolygons } from "@/utils/map";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { Feature, FeatureCollection, Polygon } from "geojson";
import { Point } from "@turf/turf";
import { TripState } from "@/context/tripContext";

interface DayPolygonsProps {
  days: Feature<Point, MapTripDay>[];
  state: TripState;
}

function DayPolygons({ days, state }: DayPolygonsProps) {
  const { theme } = useTheme();

  const dayPolygons = useMemo(() => {
    // console.log("Creating day polygons", JSON.stringify(days, null, 2));
    return createDayPolygons(days, state);
  }, [days, state]);

  console.log("DayPolygons:", dayPolygons);

  return (
    <Mapbox.ShapeSource
      id="dayPolygons"
      shape={dayPolygons as FeatureCollection<Polygon>}
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

export default React.memo(DayPolygons);
