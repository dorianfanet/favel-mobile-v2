import React from "react";
import { useTrip } from "@/context/tripContext";
import { MarkerView } from "@rnmapbox/maps";
import MapMarker from "./MapMarker";
import DayLines from "./DayLines";
import { useCamera } from "@/context/cameraContext";
import { useEditor } from "@/context/editorContext";

export default function Activities() {
  const { trip } = useTrip();
  const { viewState } = useCamera();

  const { editor, setEditor } = useEditor();

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
                  state={
                    editor
                      ? editor.type === "day"
                        ? editor.day.id === day.id
                          ? "active"
                          : "half"
                        : editor.type === "activity" &&
                          editor.activity.id === point.id
                        ? "active"
                        : "inactive"
                      : "inactive"
                  }
                  onPress={() => {
                    setEditor({
                      type: "activity",
                      scrollOnly: true,
                      activity: {
                        id: point.id!,
                        center: point.coordinates!,
                      },
                    });
                  }}
                />
              </MarkerView>
            ) : null
          )
      )}
    </>
  ) : null;
}
