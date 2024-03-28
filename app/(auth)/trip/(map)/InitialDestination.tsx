import { View, Text } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useTrip } from "@/context/tripContext";
import { MarkerView, PointAnnotation } from "@rnmapbox/maps";
import Hotspot from "./Hotspot";
import { useCamera } from "@/context/cameraContext";
import { midpoint, point } from "@turf/turf";

export default function InitialDestination() {
  const { destinationData } = useTrip();

  const { move, updatePadding } = useCamera();

  useEffect(() => {
    if (
      destinationData?.result === "destination" &&
      destinationData.destination.bounds
    ) {
      move({
        coordinates: [
          {
            latitude: destinationData.destination.bounds[0][1],
            longitude: destinationData.destination.bounds[0][0],
          },
          {
            latitude: destinationData.destination.bounds[1][1],
            longitude: destinationData.destination.bounds[1][0],
          },
        ],
      });
    }
  }, [destinationData]);

  const centerPoint = useMemo(() => {
    if (
      destinationData &&
      destinationData.result === "destination" &&
      destinationData.destination.bounds
    ) {
      return midpoint(
        point(destinationData.destination.bounds[0]),
        point(destinationData.destination.bounds[1])
      );
    }
  }, [destinationData]);

  return destinationData &&
    destinationData.result === "destination" &&
    centerPoint ? (
    <>
      <MarkerView
        id={`destinationDataMarker`}
        coordinate={[
          centerPoint.geometry.coordinates[0],
          centerPoint.geometry.coordinates[1],
        ]}
      >
        <Hotspot
          data={{
            location: destinationData.destination.location,
            duration: destinationData.destination.duration,
          }}
          noImage
        />
      </MarkerView>
    </>
  ) : null;
}
