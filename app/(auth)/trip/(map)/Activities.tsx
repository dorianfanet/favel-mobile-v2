import React from "react";
import { useTrip } from "@/context/tripContext";
import { MarkerView } from "@rnmapbox/maps";
import MapMarker from "./MapMarker";
import DayLines from "./DayLines";
import { useCamera } from "@/context/cameraContext";
import { useEditor } from "@/context/editorContext";

export default function Activities() {
  const { trip, tripMetadata } = useTrip();
  const { viewState } = useCamera();

  const { editor, setEditor } = useEditor();

  console.log(editor);

  return trip && viewState === "days" ? (
    <>
      <DayLines />
      {trip.map(
        (day, index) =>
          day.activities &&
          day.activities.map((point, pointIndex) =>
            point.category && point.coordinates && point.id
              ? ((editor &&
                  editor.type === "day" &&
                  editor.day.id === day.id) ||
                  (editor &&
                    editor.type === "activity" &&
                    editor.dayId === day.id) ||
                  (tripMetadata?.status.includes("loading") &&
                    trip.length - 1 === index)) && (
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
                      state={"active"}
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
                )
              : null
          )
      )}
    </>
  ) : null;
}
