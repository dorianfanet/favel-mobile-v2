import React from "react";
import { useTrip } from "@/context/tripContext";
import { MarkerView } from "@rnmapbox/maps";
import MapMarker from "./MapMarker";
import DayLines from "./DayLines";
import { useCamera } from "@/context/cameraContext";

export default function Activities() {
  const { trip } = useTrip();
  const { viewState } = useCamera();

  return trip && viewState === "days" ? (
    <>
      <DayLines />
      {trip.map(
        (day, index) =>
          day.activities &&
          day.activities.map((point, pointIndex) =>
            point.category && point.coordinates && point.id ? (
              <MarkerView
                key={point.id}
                id={`pointAnnotation${point.id}`}
                coordinate={[
                  point.coordinates.longitude,
                  point.coordinates.latitude,
                ]}
                allowOverlap={true}
              >
                <MapMarker
                  activity={point}
                  state="inactive"
                />
              </MarkerView>
            ) : null
          )
      )}
    </>
  ) : null;
}
