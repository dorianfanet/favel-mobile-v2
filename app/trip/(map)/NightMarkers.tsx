import { TripNight } from "@/types/trip";
import Mapbox from "@rnmapbox/maps";
import React from "react";
import MapMarker from "./MapMarker";
import useTheme from "@/hooks/useTheme";

function NightMarkers({ nights }: { nights: TripNight[] }) {
  const { theme } = useTheme();

  return (
    <>
      {nights.map((night) => (
        <MapMarker
          key={night.id}
          id={night.id}
          name={night.name}
          coordinates={[night.longitude, night.latitude]}
          icon="moonIcon"
          color={theme === "light" ? "rgb(1, 37, 121)" : "rgb(174, 198, 255)"}
        />
      ))}
    </>
  );
}

export default React.memo(NightMarkers);
