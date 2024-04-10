import React, { useEffect, useRef, useState } from "react";
import MapboxGL from "@rnmapbox/maps";
import { useCamera } from "@/context/cameraContext";
import { useTrip } from "@/context/tripContext";
import Route from "./Route";
import { TripMetadata } from "@/types/types";
import InitialDestination from "./InitialDestination";
import { Dimensions } from "react-native";
import Activities from "./Activities";
import { booleanPointInPolygon, polygon } from "@turf/turf";
import Loading from "./Loading";
import { useEditor } from "@/context/editorContext";
import { bboxToCoordinatesArray } from "@/lib/utils";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY!);

export default function Map() {
  const mapRef = useRef<MapboxGL.MapView>(null);

  const [currentZoom, setCurrentZoom] = useState<number>(0);

  const {
    easing,
    padding,
    zoom,
    minZoom,
    maxZoom,
    centerOrBounds,
    animationDuration,
    move,
    updatePadding,
    setViewState,
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
      if (tripMetadata?.status === "trip.loading") {
        updatePadding({
          paddingTop: 100,
          paddingBottom: 150,
          paddingLeft: 50,
          paddingRight: 50,
        });
      } else {
        updatePadding({
          paddingTop: 120,
          paddingBottom: screenHeight * 0.45,
          paddingLeft: 80,
          paddingRight: 80,
        });
      }
    }
  }, [tripMetadata?.status]);

  function checkForHotspotsInBounds(camera: MapboxGL.MapState) {
    const boundsPolygon = polygon([
      [
        [camera.properties.bounds.sw[0], camera.properties.bounds.sw[1]],
        [camera.properties.bounds.ne[0], camera.properties.bounds.sw[1]],
        [camera.properties.bounds.ne[0], camera.properties.bounds.ne[1]],
        [camera.properties.bounds.sw[0], camera.properties.bounds.ne[1]],
        [camera.properties.bounds.sw[0], camera.properties.bounds.sw[1]],
      ],
    ]);

    let pointsInBounds = 0;

    if (tripMetadata && tripMetadata.route) {
      tripMetadata.route.forEach((route) => {
        if (
          booleanPointInPolygon(route.coordinates, boundsPolygon) &&
          route.location
        ) {
          pointsInBounds++;
        }
      });
    }

    if (pointsInBounds < 2 && currentZoom > 8) {
      setViewState("days");
    } else {
      setViewState("hotspots");
    }
  }

  const { editor, setEditor } = useEditor();

  useEffect(() => {
    if (editor) {
      if (editor.type === "day") {
        move({
          coordinates: editor.day.bounds
            ? bboxToCoordinatesArray(editor.day.bounds)
            : [
                {
                  latitude: editor.day.center[1],
                  longitude: editor.day.center[0],
                },
              ],
        });
      } else if (editor.type === "activity") {
        move({
          coordinates: [editor.activity.center],
          customZoom: 15,
        });
      }
    }
  }, [editor]);

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
      rotateEnabled={false}
      onCameraChanged={(camera) => {
        setCurrentZoom(camera.properties.zoom);
        checkForHotspotsInBounds(camera);
      }}
      onPress={() => {
        setEditor(null);
      }}
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
        animationDuration={animationDuration}
        animationMode={easing}
      />
      <Loading />
      <Activities />
      <Route />
      <InitialDestination />
    </MapboxGL.MapView>
  );
}
