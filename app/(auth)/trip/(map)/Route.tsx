import { View, Text } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useTrip } from "@/context/tripContext";
import {
  Feature,
  FeatureCollection,
  LineString,
  Properties,
  along,
  length,
  lineString,
  pointOnFeature,
} from "@turf/turf";
import { Route as RouteType } from "@/types/types";
import MapboxGL, { MarkerView } from "@rnmapbox/maps";
import Colors from "@/constants/Colors";
import Hotspot from "./Hotspot";
import { useCamera } from "@/context/cameraContext";

function getMidpoint(route?: RouteType) {
  if (!route) return pointOnFeature({ type: "Point", coordinates: [0, 0] });
  const lineLength = length(lineString(route.geometry.coordinates));
  return along(route.geometry, lineLength / 2, { units: "kilometers" });
}

export default function Route() {
  const { trip, tripMetadata } = useTrip();

  const { move } = useCamera();

  const transferDaysTrip = useMemo(() => {
    if (trip) {
      const result = trip.filter((day) => day.type === "transfer");
      return result;
    } else {
      return [];
    }
  }, [trip]);

  const routeLines: FeatureCollection<LineString, Properties> = useMemo(() => {
    let tempFeatures: Feature<LineString, Properties>[] = [];

    if (transferDaysTrip && transferDaysTrip.length > 0) {
      transferDaysTrip.map((day) => {
        day.activities?.forEach((activity) => {
          if (activity.route) {
            tempFeatures.push({
              type: "Feature",
              properties: {
                duration: activity.route?.duration,
                type: activity.route?.type,
                midpoint: getMidpoint(activity.route),
              },
              geometry: activity.route
                ? activity.route.geometry
                : { type: "LineString", coordinates: [] },
            });
          }
        });
      });
    } else if (tripMetadata && tripMetadata.route) {
      tempFeatures.push({
        type: "Feature",
        properties: {
          type: "default",
        },
        geometry: {
          type: "LineString",
          coordinates: tripMetadata.route.map((route) => route.coordinates),
        },
      });
    }

    return {
      type: "FeatureCollection",
      features: tempFeatures,
    };
  }, [transferDaysTrip, tripMetadata?.route]);

  useEffect(() => {
    if (tripMetadata?.route) {
      move({
        coordinates: tripMetadata.route.map((route) => {
          return {
            latitude: route.coordinates[1],
            longitude: route.coordinates[0],
          };
        }),
        customZoom: 10,
      });
    }
  }, [tripMetadata?.route]);

  return (
    <>
      <MapboxGL.ShapeSource
        id={"route"}
        key={"route"}
        shape={routeLines}
      >
        <MapboxGL.LineLayer
          id={"route-layer"}
          style={{
            lineColor: [
              "match",
              ["get", "type"],
              "driving",
              Colors.map.driving,
              "transit",
              Colors.map.transit,
              "default",
              Colors.light.primary,
              Colors.light.primary,
            ],
            lineWidth: 4,
            // lineOpacity: state === "transparent" ? 0.3 : 1,
          }}
          aboveLayerID="waterway-label"
        />
        <MapboxGL.LineLayer
          id={"route-layer-base"}
          style={{
            lineColor: "#fff",
            lineWidth: 6,
            // lineOpacity: state === "transparent" ? 0 : 1,
          }}
          aboveLayerID="waterway-label"
        />
      </MapboxGL.ShapeSource>
      {/* {routeLines.features.map((day, index) => (
            <MarkerView
              key={`day-${index}`}
              id={`day-${index}`}
              coordinate={
                day.properties
                  ? day.properties.midpoint.geometry.coordinates
                  : [0, 0]
              }
            >
              <Animated.View style={[animatedStyle]}>
                <View
                  style={{
                    borderRadius: 7,
                    backgroundColor:
                      Colors.map[
                        day.properties
                          ? (day.properties.type as "driving" | "transit")
                          : "driving"
                      ],
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Icon
                    icon={`${
                      day.properties
                        ? (day.properties.type as "driving" | "transit")
                        : "driving"
                    }Icon`}
                    size={14}
                    color={"white"}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 12,
                      fontFamily: "Outfit_600SemiBold",
                    }}
                  >
                    {secondsToHoursMinutes(day.properties?.duration || 0)}
                  </Text>
                </View>
              </Animated.View>
            </MarkerView>
          ))} */}
      {tripMetadata &&
        tripMetadata.route &&
        tripMetadata.route.map((route, index) => (
          <MarkerView
            key={`${route.location}-${index}`}
            id={`pointAnnotation${index}`}
            coordinate={route.coordinates}
            allowOverlap={true}
          >
            {/* <Animated.View style={[animatedStyle]}>
            </Animated.View>  */}
            <Hotspot
              data={{
                id: route.id ? route.id : "",
                location: route.location,
                duration: route.duration,
              }}
            />
          </MarkerView>
        ))}
    </>
  );
}
