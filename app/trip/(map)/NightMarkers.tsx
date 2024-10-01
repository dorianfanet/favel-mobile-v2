import { TripNight } from "@/types/trip";
import Mapbox from "@rnmapbox/maps";
import React from "react";
import MapMarker from "./MapMarker";

function NightMarkers({ nights }: { nights: TripNight[] }) {
  return (
    <>
      {nights.map((night) => (
        <MapMarker
          key={night.id}
          id={night.id}
          name={night.name}
          coordinates={[night.centerPoint.lng, night.centerPoint.lat]}
          icon="moonIcon"
          color="rgb(30, 105, 210)"
        />
      ))}
    </>
  );
}

export default React.memo(NightMarkers);
