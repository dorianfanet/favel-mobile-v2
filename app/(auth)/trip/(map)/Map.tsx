import React, { useEffect, useRef } from "react";
import MapboxGL from "@rnmapbox/maps";
import { useCamera } from "@/context/cameraContext";
import { useTrip } from "@/context/tripContext";
import Route from "./Route";
import { TripMetadata } from "@/types/types";
import InitialDestination from "./InitialDestination";
import { Dimensions } from "react-native";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY!);

export default function Map() {
  const mapRef = useRef<MapboxGL.MapView>(null);

  const {
    easing,
    padding,
    zoom,
    minZoom,
    maxZoom,
    centerOrBounds,
    move,
    updatePadding,
  } = useCamera();

  const { tripMetadata, destinationData } = useTrip();

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (tripMetadata?.status === "new") {
      updatePadding({
        paddingTop: 50,
        paddingBottom: 300,
        paddingLeft: 50,
        paddingRight: 50,
      });
    } else if (tripMetadata?.status === "new.route") {
      updatePadding({
        paddingTop: 50,
        paddingBottom: screenHeight * 0.45,
        paddingLeft: 50,
        paddingRight: 50,
      });
    } else if (tripMetadata?.status.startsWith("trip")) {
      updatePadding({
        paddingTop: 50,
        paddingBottom: screenHeight * 0.35,
        paddingLeft: 50,
        paddingRight: 50,
      });
    }
  }, [tripMetadata?.status]);

  return (
    <MapboxGL.MapView
      ref={mapRef}
      style={{
        flex: 1,
      }}
      scaleBarEnabled={false}
      attributionEnabled={false}
      logoEnabled={false}
      styleURL="mapbox://styles/dorianfanet/clj4mafi6000201qx5ci9eaj8"
    >
      <MapboxGL.Camera
        {...centerOrBounds}
        zoomLevel={zoom}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
        padding={{
          paddingTop: padding.paddingTop,
          paddingBottom: padding.paddingBottom,
          paddingLeft: padding.paddingLeft,
          paddingRight: padding.paddingRight,
        }}
        animationDuration={2000}
        animationMode={easing}
      />
      <Route />
      <InitialDestination />
    </MapboxGL.MapView>
  );
}
