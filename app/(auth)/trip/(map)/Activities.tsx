import React from "react";
import { useTrip } from "@/context/tripContext";
import { MarkerView } from "@rnmapbox/maps";
import MapMarker from "./MapMarker";
import DayLines from "./DayLines";
import { useCamera } from "@/context/cameraContext";
import { useEditor } from "@/context/editorContext";
import { View } from "react-native";

export default function Activities() {
  const { trip, tripMetadata } = useTrip();
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
                key={`pointAnnotation${point.id}-${index}-${pointIndex}`}
                id={`pointAnnotation${point.id}-${index}-${pointIndex}`}
                coordinate={[
                  point.coordinates.longitude,
                  point.coordinates.latitude,
                ]}
                allowOverlap={true}
              >
                <View
                  style={{
                    opacity:
                      tripMetadata?.status.includes("loading") &&
                      trip.length - 1 === index
                        ? 1
                        : editor
                        ? (editor.type === "day" && editor.day.id === day.id) ||
                          (editor &&
                            editor.type === "activity" &&
                            editor.dayId === day.id)
                          ? 1
                          : 0.3
                        : 1,
                  }}
                >
                  <MapMarker
                    activity={point}
                    state={
                      (editor &&
                        editor.type === "day" &&
                        editor.day.id === day.id) ||
                      (editor &&
                        editor.type === "activity" &&
                        editor.dayId === day.id)
                        ? "active"
                        : "inactive"
                    }
                    onPress={() => {
                      setEditor({
                        type: "activity",
                        dayId: day.id!,
                        scrollOnly: true,
                        activity: {
                          id: point.id!,
                          center: point.coordinates!,
                        },
                      });
                    }}
                  />
                </View>
              </MarkerView>
            ) : null
          )
      )}
    </>
  ) : null;
}
