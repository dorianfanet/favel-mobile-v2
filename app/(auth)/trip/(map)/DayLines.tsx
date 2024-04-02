import React, { useEffect, useMemo, useState } from "react";
import MapboxGL, { MarkerView } from "@rnmapbox/maps";
import {
  BBox,
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Position,
  bbox,
  center,
  lineString,
  point,
  points,
} from "@turf/turf";
import { useTrip } from "@/context/tripContext";
import { Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "@/components/Themed";
import { useEditor } from "@/context/editorContext";

export default function DayLines() {
  const { trip } = useTrip();

  const [dayLines, setDayLines] =
    useState<GeoJSON.FeatureCollection<GeoJSON.LineString> | null>(null);

  useEffect(() => {
    if (!trip) return;

    let tempFeatureColletion: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: "FeatureCollection",
      features: [],
    };

    trip.forEach((day, index) => {
      let tempCoordinates: Position[] = [];

      if (day.type === "day" && day.activities && day.activities.length > 1) {
        let feature: GeoJSON.Feature<LineString> = {
          type: "Feature",
          properties: {
            id: day.id,
          },
          geometry: {
            type: "LineString",
            coordinates: tempCoordinates,
          },
        };

        day.activities.forEach((activity) => {
          if (
            activity.coordinates &&
            activity.coordinates.latitude &&
            activity.coordinates.longitude
          ) {
            // @ts-ignore
            tempCoordinates.push([
              activity.coordinates.longitude,
              activity.coordinates.latitude,
            ]);
          }
        });

        tempFeatureColletion.features.push(feature);
      }
    });

    setDayLines(tempFeatureColletion);
  }, [trip]);

  const dayLabels = useMemo(() => {
    if (!trip) return;

    const tempFeatures: {
      coordinates: Position;
      bounds: BBox;
      index: number;
      id: string;
    }[] = [];

    trip.forEach((day, index) => {
      try {
        if (day.activities && day.activities.length > 1 && day.type === "day") {
          const noRouteActivities = day.activities?.filter(
            (activity) => activity.type !== "route"
          );

          const pointsOfDay: Position[] = [];

          noRouteActivities.map((activity) => {
            if (activity.coordinates) {
              pointsOfDay.push([
                activity.coordinates.longitude,
                activity.coordinates.latitude,
              ]);
            }
          });

          const features = points(pointsOfDay);
          const centerPoint = center(features);

          const line = lineString(pointsOfDay);
          const bounds = bbox(line);

          tempFeatures.push({
            coordinates: centerPoint.geometry.coordinates,
            bounds: bounds,
            index: index,
            id: day.id!,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });

    return tempFeatures;
  }, [trip]);

  return dayLines ? (
    <>
      <MapboxGL.ShapeSource
        id="dayLines"
        shape={dayLines}
      >
        <MapboxGL.LineLayer
          id="dayLinesLayer"
          style={{
            lineColor: "rgba(34, 52, 104, 1)",
            lineWidth: 3,
            lineCap: MapboxGL.LineJoin.Round,
            lineJoin: MapboxGL.LineJoin.Round,
            lineOpacity: 1,
          }}
        />
      </MapboxGL.ShapeSource>
      {dayLabels &&
        dayLabels.map((label, index) => (
          <>
            <MarkerView
              key={`day-label-${index}`}
              id={`label-${index}`}
              coordinate={label.coordinates}
              allowOverlap={true}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#0d4376dc",
                  padding: 5,
                  borderRadius: 5,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  Jour {label.index + 1}
                </Text>
              </TouchableOpacity>
            </MarkerView>
          </>
        ))}
    </>
  ) : null;
}
