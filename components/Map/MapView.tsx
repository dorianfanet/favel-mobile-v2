import React, { Children } from "react";
import MapboxGL, { CameraAnimationMode, CameraBounds } from "@rnmapbox/maps";
import { useColorScheme } from "react-native";
import { findMapStyle } from "./utils";
import { Position } from "@turf/turf";
import { Button, View } from "../Themed";
import Mapbox from "@rnmapbox/maps";

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY!);

interface MapViewProps extends React.ComponentProps<typeof MapboxGL.MapView> {
  centerOrBounds: {
    centerCoordinate?: Position;
    bounds?: CameraBounds;
  };
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  padding: {
    paddingLeft: number;
    paddingRight: number;
    paddingTop: number;
    paddingBottom: number;
  };
  animationDuration?: number;
  easing: CameraAnimationMode;
  children?: React.ReactNode;
}

export default function MapView(props: MapViewProps) {
  const {
    centerOrBounds,
    zoom,
    minZoom,
    maxZoom,
    padding,
    animationDuration,
    easing,
    children,
    ...otherProps
  } = props;

  const theme = useColorScheme();
  const mapRef = React.useRef<MapboxGL.MapView>(null);
  const cameraRef = React.useRef<Mapbox.Camera>(null);

  return (
    <MapboxGL.MapView
      ref={mapRef}
      style={{
        flex: 1,
      }}
      scaleBarEnabled={false}
      attributionEnabled={false}
      logoEnabled={false}
      styleURL={findMapStyle(theme || "light")}
      rotateEnabled={false}
      pitchEnabled={false}
      projection="globe"
      {...otherProps}
    >
      <MapboxGL.Camera
        {...centerOrBounds}
        ref={cameraRef}
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
      {children}
    </MapboxGL.MapView>
  );
}
