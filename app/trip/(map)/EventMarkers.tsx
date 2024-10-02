import { TripEvent } from "@/types/trip";
import React from "react";
import MapMarker from "./MapMarker";
import { FeatureCollection, Point } from "@turf/turf";
import Mapbox from "@rnmapbox/maps";

function EventMarkers({
  events,
}: {
  events: FeatureCollection<Point, TripEvent>;
}) {
  return (
    <>
      <Mapbox.ShapeSource
        id="eventsSource"
        shape={events}
      >
        <Mapbox.SymbolLayer
          id="eventsSymbol"
          style={{
            iconImage: "harbor",
            iconAllowOverlap: true,
            textAllowOverlap: true,
            textField: "Golden Gate Park",
            textAnchor: "center",
            textOffset: [0, 2],
            iconSize: 3,
            iconOpacity: 0,
            textOpacity: 0,
          }}
        />
      </Mapbox.ShapeSource>
      {events.features.map((event) =>
        event.properties.type === "activity" ? (
          <MapMarker
            key={event.properties.id}
            id={event.properties.id}
            name={event.properties.place.name}
            coordinates={event.geometry.coordinates}
          />
        ) : null
      )}
    </>
  );
}

export default React.memo(EventMarkers);
