import React, { useEffect, useMemo, useRef, useState } from "react";
import { TripEventTransport } from "@/types/trip";
import { Button, Text, View } from "@/components/Themed";
import { FeatureCollection, LineString, Point } from "@turf/turf";
import Mapbox from "@rnmapbox/maps";
import { center } from "@turf/turf";
import Colors from "@/constants/Colors";
import useTheme from "@/hooks/useTheme";
import { formatSeconds } from "@/utils/time";
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Path, Svg } from "react-native-svg";
import { TouchableOpacity } from "react-native-gesture-handler";

type TransportMarkersProps = {
  transportEvents: FeatureCollection<LineString, TripEventTransport>;
  mapRef: React.MutableRefObject<Mapbox.MapView | null>;
};

export default function TransportMarkers({
  transportEvents,
  mapRef,
}: TransportMarkersProps) {
  const centerPoints = useMemo(() => {
    return transportEvents.features.map((event) => {
      const centerPoint = center(event, {
        properties: {
          duration: event.properties.transport.duration,
          id: event.properties.id,
        },
      });
      return centerPoint;
    });
  }, [transportEvents]);

  console.log(JSON.stringify(centerPoints, null, 2));
  const { theme } = useTheme();

  return (
    <>
      <Mapbox.ShapeSource
        id="transportSource"
        shape={transportEvents}
      >
        <Mapbox.LineLayer
          id="transportLine"
          style={{
            lineColor: "#91e1f9",
            // lineColor: "#539FF3",
            // lineColor: "#51dcfb",
            lineWidth: 0,
          }}
          aboveLayerID="waterway-label"
        />
        <Mapbox.LineLayer
          id="transportLine2"
          style={{
            lineColor: "#44b6e7",
            // lineColor: "#00a2d7",
            // lineColor: "#5584BD",
            lineWidth: 4,
          }}
          aboveLayerID="transportLine"
        />
      </Mapbox.ShapeSource>
      {/* <Mapbox.PointAnnotation
        id="transportPoint"
        title="transportPoint"
        coordinate={centerPoints[0].geometry.coordinates}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 10,
          }}
        />
      </Mapbox.PointAnnotation> */}
      {centerPoints.map((centerPoint) => (
        <Mapbox.MarkerView
          key={centerPoint.properties.id}
          id={centerPoint.properties.id}
          coordinate={centerPoint.geometry.coordinates}
          // onSelected={() => console.log("onSelected")}
        >
          <TouchableOpacity
            style={{
              // backgroundColor: "#44c0e7",
              // padding: 5,
              // paddingVertical: 2,
              transform: [
                {
                  translateY: -15,
                },
                {
                  translateX: 27,
                },
              ],
              zIndex: 5,
            }}
          >
            <Svg
              height="50"
              width="60"
              viewBox="0 0 60 24"
              // style={{
              //   shadowColor: "#000",
              //   shadowOffset: {
              //     width: -1,
              //     height: 1,
              //   },
              //   shadowOpacity: 0.5,
              //   shadowRadius: 5,
              //   elevation: 4,
              // }}
            >
              <Path
                d="M9.14756 0.857422C6.93857 0.857422 5.14756 2.64844 5.14756 4.85742C5.14756 4.85742 5.14756 13.1984 5.14756 15.0898C5.14756 16.9813 1.43526 23.5082 1.43526 23.5082C1.43526 23.5082 0.224704 25.6289 1.16611 26.5352C1.57676 26.9316 2.32724 26.9043 3.04209 26.748C3.96494 26.5469 4.80938 25.876 4.80938 25.876C4.80938 25.876 9.90015 22.0781 12.1974 22.0781C14.4946 22.0781 50.6109 22.0781 50.6109 22.0781C52.8199 22.0781 54.6109 20.2871 54.6109 18.0781V4.85742C54.6109 2.64844 52.8199 0.857422 50.6109 0.857422H9.14756Z"
                fill="#18232c"
                // fill="#4ccbf1"
              />
            </Svg>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                fontStyle="caption"
                style={{
                  color: Colors[theme].accent,
                  // color: Colors[theme].background.primary,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {`${
                  formatSeconds(centerPoint.properties.duration).minutes
                } min`}
              </Text>
            </View>
          </TouchableOpacity>
          {/* <View
            style={{
              width: 60,
              height: 30,
              justifyContent: "center",
              alignItems: "center",
              transform: [
                {
                  translateY: -15,
                },
                {
                  translateX: 30,
                },
              ],
            }}
          >
            <View
              style={{
                backgroundColor: "#44c0e7",
                padding: 5,
                paddingVertical: 2,
                borderRadius: 5,
                transform: [
                  {
                    translateX: 2,
                  },
                ],
              }}
            >
              <Text
                fontStyle="caption"
                style={{
                  color: Colors[theme].background.primary,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {`${
                  formatSeconds(centerPoint.properties.duration).minutes
                } min`}
              </Text>
              <Svg
                height="13"
                width="12"
                style={{
                  position: "absolute",
                  bottom: -5,
                  left: -5,
                  transform: [{ rotate: "180deg" }],
                }}
              >
                <Path
                  d="M0.0214844 5.14966L7.15766 12.2866L11.2658 3.66686C11.2658 3.66686 12.2069 1.48225 11.2658 0.575651C10.3248 -0.330943 7.60238 0.978103 7.60238 0.978103L0.0214844 5.14966Z"
                  fill="#44c0e7"
                />
              </Svg>
            </View>
          </View> */}
        </Mapbox.MarkerView>
      ))}
    </>
  );
}
