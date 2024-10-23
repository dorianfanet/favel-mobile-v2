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
  enum TravelCategory {
    CulturalAndHistorical = "Cultural & Historical Sites",
    NatureAndOutdoors = "Nature & Outdoors",
    EntertainmentAndNightlife = "Entertainment & Nightlife",
    DiningAndCulinary = "Dining & Culinary",
    Shopping = "Shopping",
    AdventureAndSports = "Adventure & Sports",
    WellnessAndRelaxation = "Wellness & Relaxation",
    ReligiousAndSpiritual = "Religious & Spiritual",
    EventsAndFestivals = "Events & Festivals",
    FamilyAttractions = "Family Attractions",
    Accommodations = "Accommodations",
  }

  const travelCategoryColors = {
    [TravelCategory.CulturalAndHistorical]: {
      light: "#8C564B",
      dark: "#FFB09C", // More vibrant in dark mode
    },
    [TravelCategory.NatureAndOutdoors]: {
      light: "#52E472",
      dark: "#76F076", // Brighter green in dark mode
    },
    [TravelCategory.EntertainmentAndNightlife]: {
      light: "#FF7F0E",
      dark: "#ffb066", // Vibrant orange for dark mode
    },
    [TravelCategory.DiningAndCulinary]: {
      light: "#D62728",
      dark: "#FF6B6B", // Vibrant red for dark mode
    },
    [TravelCategory.Shopping]: {
      light: "#9467BD",
      dark: "#D6A9FF", // Vibrant purple for dark mode
    },
    [TravelCategory.AdventureAndSports]: {
      light: "#1F77B4",
      dark: "#64B5F6", // Lighter blue for dark mode
    },
    [TravelCategory.WellnessAndRelaxation]: {
      light: "#17BECF",
      dark: "#5BD3FF", // More vibrant cyan for dark mode
    },
    [TravelCategory.FamilyAttractions]: {
      light: "#E377C2",
      dark: "#FF9BCE", // Bright pink for dark mode
    },
    [TravelCategory.Accommodations]: {
      light: "#2C3E50", // Dark blue to evoke night-time feel
      dark: "#b4d4f5", // Slightly lighter and more vibrant blue in dark mode
    },
  };

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
            color={travelCategoryColors["Nature & Outdoors"].light}
          />
        ) : null
      )}
    </>
  );
}

export default React.memo(EventMarkers);
