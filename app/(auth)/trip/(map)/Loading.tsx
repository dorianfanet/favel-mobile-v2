import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { Coordinate, useCamera } from "@/context/cameraContext";
import { Position } from "@turf/turf";

export default function Loading() {
  const { trip, tripMetadata } = useTrip();
  const { move } = useCamera();

  useEffect(() => {
    if (!tripMetadata) return;
    if (tripMetadata.status === "trip.loading" && trip) {
      if (trip.length > 0) {
        const lastDay = trip[trip.length - 1];
        const hotspot = tripMetadata.route?.find(
          (route) => route.id === lastDay.hotspotId
        );
        console.log("hotspot", hotspot);
        if (hotspot) {
          move({
            coordinates: [
              {
                latitude: hotspot.coordinates[1],
                longitude: hotspot.coordinates[0],
              },
            ],
            customZoom: 11,
          });
        }
      }
    }
  }, [trip, tripMetadata?.status]);

  return <></>;
}
