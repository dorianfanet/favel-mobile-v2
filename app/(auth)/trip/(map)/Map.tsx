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
import i18n from "@/i18n";

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

  const { tripMetadata } = useTrip();

  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    if (tripMetadata?.status.startsWith("new")) {
      if (tripMetadata?.status === "new") {
        updatePadding({
          paddingTop: 50,
          paddingBottom: 50,
          paddingLeft: 50,
          paddingRight: 50,
        });
      } else {
        updatePadding({
          paddingTop: 400,
          paddingBottom: 100,
          paddingLeft: 50,
          paddingRight: 50,
        });
      }
    } else if (tripMetadata?.status.startsWith("trip")) {
      if (tripMetadata?.status === "trip.loading") {
        updatePadding({
          paddingTop: 120,
          paddingBottom: 120,
          paddingLeft: 80,
          paddingRight: 80,
        });
      } else {
        updatePadding({
          paddingTop: 120,
          paddingBottom: screenHeight * 0.45,
          paddingLeft: 80,
          paddingRight: 80,
        });
      }
    } else {
      updatePadding({
        paddingTop: 120,
        paddingBottom: 120,
        paddingLeft: 80,
        paddingRight: 80,
      });
    }
  }, [tripMetadata?.status]);

  function checkForHotspotsInBounds(camera: MapboxGL.MapState) {
    if (tripMetadata && tripMetadata.status.startsWith("new")) {
      setViewState("hotspots");
      return;
    }

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

    if (pointsInBounds < 2 || currentZoom > 8) {
      setViewState("days");
    } else {
      setViewState("hotspots");
    }
  }

  const { editor, setEditor } = useEditor();

  useEffect(() => {
    if (editor) {
      if (editor.type === "day") {
        if (editor.day.bounds) {
          move({
            coordinates: bboxToCoordinatesArray(editor.day.bounds),
          });
        }
        if (editor.day.center) {
          move({
            coordinates: [
              {
                latitude: editor.day.center[1],
                longitude: editor.day.center[0],
              },
            ],
            customZoom: 15,
          });
        }
      } else if (editor.type === "activity") {
        move({
          coordinates: [editor.activity.center],
          customZoom: 15,
        });
      }
    } else if (
      tripMetadata?.route &&
      !tripMetadata.status.includes("loading")
    ) {
      if (tripMetadata?.route && !tripMetadata.status.includes("loading")) {
        if (tripMetadata.route.length === 1 && tripMetadata.route[0].bbox) {
          move({
            coordinates: [
              {
                latitude: tripMetadata.route[0].bbox[1],
                longitude: tripMetadata.route[0].bbox[0],
              },
              {
                latitude: tripMetadata.route[0].bbox[3],
                longitude: tripMetadata.route[0].bbox[2],
              },
            ],
            customEasing: "flyTo",
          });
        } else {
          move({
            coordinates: tripMetadata.route.map((route) => {
              return {
                latitude: route.coordinates[1],
                longitude: route.coordinates[0],
              };
            }),
            customZoom: 10,
            customEasing: "flyTo",
          });
        }
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
      // styleURL="mapbox://styles/dorianfanet/clzfqoo7100do01qr9bad7vtk"
      styleURL={
        i18n.language === "fr"
          ? "mapbox://styles/dorianfanet/clj4mafi6000201qx5ci9eaj8"
          : "mapbox://styles/mapbox/streets-v12"
      }
      rotateEnabled={false}
      pitchEnabled={false}
      onCameraChanged={(camera) => {
        setCurrentZoom(camera.properties.zoom);
        checkForHotspotsInBounds(camera);
      }}
      onPress={() => {
        console.log("map press");
        setEditor(null);
      }}
      projection="globe"
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
      <Route />
      <Activities />
      <InitialDestination />
      {/* <Suggestions /> */}
    </MapboxGL.MapView>
  );
}
