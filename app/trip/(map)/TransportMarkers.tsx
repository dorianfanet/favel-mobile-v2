import React, { useEffect, useMemo, useRef, useState } from "react";
import { TripEventTransport } from "@/types/trip";
import { Button, Text, View } from "@/components/Themed";
import {
  Feature,
  featureCollection,
  FeatureCollection,
  lineString,
  LineString,
  Point,
} from "@turf/turf";
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
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";
import { TouchableOpacity } from "react-native";
import { useCamera } from "@/context/cameraContext";
import { TransportMode, TransportSection } from "@/types/transport";
import { darkenHexColor } from "@/utils/misc";
import { useTripNavigationActions } from "@/hooks/useTripNavigationActions";
import Icon from "@/components/Icon";

type TransportMarkersProps = {
  transportEvents: FeatureCollection<LineString, TripEventTransport>;
  mapRef: React.MutableRefObject<Mapbox.MapView | null>;
  onPress?: () => void;
  selectedTransportId?: string | null;
};

export default function TransportMarkers({
  transportEvents,
  mapRef,
  onPress,
  selectedTransportId,
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

  const { theme } = useTheme();

  // const [selected, setSelected] = useState<string | null>(null);

  const { openSheet } = useBottomSheetRefs();

  const { move, updatePadding } = useCamera();

  const { push } = useTripNavigationActions();

  const handlePress = (id: string) => {
    push({
      bottomSheet: "transport",
      selectedTransportId: id,
    });
    // setSelected(id);
    // openSheet("transport");
  };

  const routeGeojson = useMemo(() => {
    const newRoute: Feature<
      LineString,
      {
        duration: number;
        color?: string;
        darkerColor?: string;
        mode: TransportMode;
      }
    >[] = route.map((event) => {
      return lineString(event.polyline.geometry.coordinates, {
        duration: event.duration,
        color: event.color,
        darkerColor: event.color ? darkenHexColor(event.color, 0.2) : undefined,
        mode: event.mode,
      });
    });
    return featureCollection(newRoute);
  }, [transportEvents]);

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
            lineOpacity: selectedTransportId ? 0 : 1,
          }}
          aboveLayerID="transportLine"
        />
      </Mapbox.ShapeSource>
      <Mapbox.ShapeSource
        id="routeSource"
        shape={routeGeojson}
      >
        <Mapbox.LineLayer
          id="routeLine"
          style={{
            lineColor: [
              "to-color",
              ["get", "darkerColor"],
              "match",
              ["get", "mode"],
              "pedestrian",
              Colors[theme].accent,
            ],
            lineWidth: 8,
            lineOpacity: selectedTransportId ? 1 : 0,
          }}
          aboveLayerID="waterway-label"
        />
        <Mapbox.LineLayer
          id="routeLine2"
          style={{
            lineColor: [
              "to-color",
              ["get", "color"],
              "match",
              ["get", "mode"],
              "pedestrian",
              Colors[theme].accent,
            ],
            lineWidth: 4,
            lineOpacity: selectedTransportId ? 1 : 0,
          }}
          aboveLayerID="routeLine"
        />
      </Mapbox.ShapeSource>
      {selectedTransportId && (
        <Mapbox.MarkerView
          key={"transport-full"}
          id={"transport-full"}
          coordinate={[-122.45371999999999, 37.77009999999999]}
          // onSelected={() => console.log("onSelected")}
        >
          <TouchableOpacity
            style={{
              // backgroundColor: "#44c0e7",
              // padding: 5,
              // paddingVertical: 2,
              transform: [
                {
                  translateY: -17,
                },
                {
                  translateX: 32,
                },
              ],
              zIndex: 5,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.15,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Svg
              height="50"
              width="80"
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
                fill={theme === "light" ? "#ffffff" : "#18232c"}
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
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Icon
                icon="kickScooterIcon"
                size={14}
                strokeWidth={2}
                color="#FD5535"
              />
              <Text
                fontStyle="caption"
                style={{
                  color: "#FD5535",
                  // color: Colors[theme].background.primary,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {`10 min`}
              </Text>
            </View>
          </TouchableOpacity>
        </Mapbox.MarkerView>
      )}
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
      {!selectedTransportId &&
        centerPoints.map((centerPoint) => (
          <Mapbox.MarkerView
            key={centerPoint.properties.id}
            id={centerPoint.properties.id}
            coordinate={centerPoint.geometry.coordinates}
            onTouchEnd={() => {}}
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
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 5,
              }}
              onPress={() => {
                handlePress(centerPoint.properties.id);
                updatePadding({
                  paddingLeft: 50,
                  paddingRight: 50,
                  paddingTop: 100,
                  paddingBottom: 400,
                });
                move({
                  coordinates: [
                    {
                      latitude:
                        transportEvents.features[0].geometry.coordinates[0][1],
                      longitude:
                        transportEvents.features[0].geometry.coordinates[0][0],
                    },
                    {
                      latitude:
                        transportEvents.features[0].geometry.coordinates[1][1],
                      longitude:
                        transportEvents.features[0].geometry.coordinates[1][0],
                    },
                  ],
                });
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
                  fill={theme === "light" ? "#ffffff" : "#18232c"}
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
          </Mapbox.MarkerView>
        ))}
    </>
  );
}

const route: TransportSection[] = [
  {
    id: "R0-S0",
    duration: 165,
    length: 164,
    mode: "pedestrian",
    sectionIndex: 0,
    departureTime: new Date("2024-10-03T15:40:51.000Z"),
    arrivalTime: new Date("2024-10-03T15:43:36.000Z"),
    departure: {
      lat: 37.7724734,
      lng: -122.4375787,
    },
    arrival: {
      lat: 37.7719019,
      lng: -122.4393083,
    },
    polyline: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.437295, 37.772512],
          [-122.43723, 37.77221],
          [-122.43735, 37.77219],
          [-122.43847, 37.77205],
          [-122.43865, 37.77203],
          [-122.43876, 37.77202],
          [-122.4389, 37.772],
          [-122.439317, 37.771946],
        ],
      },
    },
  },
  {
    id: "R0-S1",
    duration: 646,
    length: 2409,
    mode: "kickScooter",
    sectionIndex: 1,
    departureTime: new Date("2024-10-03T15:44:36.000Z"),
    arrivalTime: new Date("2024-10-03T15:53:22.000Z"),
    departure: {
      lat: 37.7719019,
      lng: -122.4393083,
    },
    arrival: {
      lat: 37.7693067,
      lng: -122.4652067,
    },
    polyline: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.439317, 37.771946],
          [-122.44059, 37.77178],
          [-122.44077, 37.77176],
          [-122.44219, 37.77158],
          [-122.44382999999999, 37.77136],
          [-122.44503999999999, 37.7712],
          [-122.44554, 37.77114],
          [-122.44645, 37.77102],
          [-122.44711, 37.77092],
          [-122.44776999999999, 37.77084],
          [-122.44874999999999, 37.77072],
          [-122.45042999999998, 37.770509999999994],
          [-122.45204999999999, 37.770309999999995],
          [-122.45371999999999, 37.77009999999999],
          [-122.45401999999999, 37.770059999999994],
          [-122.45405999999998, 37.77007],
          [-122.45410999999999, 37.77008],
          [-122.45425999999999, 37.77008],
          [-122.45455, 37.77012],
          [-122.455, 37.770199999999996],
          [-122.45514, 37.77025999999999],
          [-122.45543, 37.77033999999999],
          [-122.4555, 37.77031999999999],
          [-122.45557, 37.77031999999999],
          [-122.45563999999999, 37.770619999999994],
          [-122.45566999999998, 37.770649999999996],
          [-122.45576999999999, 37.77072],
          [-122.45599999999999, 37.77075],
          [-122.45658999999999, 37.77084],
          [-122.45670999999999, 37.77087],
          [-122.45695999999998, 37.77091],
          [-122.45726999999998, 37.77096],
          [-122.45757999999998, 37.771],
          [-122.45787999999997, 37.77076],
          [-122.45795999999997, 37.77069],
          [-122.45815999999998, 37.77059],
          [-122.45836999999997, 37.770559999999996],
          [-122.45858999999997, 37.77054999999999],
          [-122.45861999999997, 37.770619999999994],
          [-122.45866999999997, 37.770689999999995],
          [-122.45875999999997, 37.77072],
          [-122.45911999999997, 37.770739999999996],
          [-122.45924999999997, 37.770799999999994],
          [-122.45937999999997, 37.770669999999996],
          [-122.45942999999997, 37.770619999999994],
          [-122.45949999999996, 37.770599999999995],
          [-122.45962999999996, 37.770599999999995],
          [-122.46000999999997, 37.770489999999995],
          [-122.46012999999996, 37.77043],
          [-122.46029999999996, 37.77041],
          [-122.46049999999997, 37.77036],
          [-122.46067999999997, 37.77034999999999],
          [-122.46083999999996, 37.77034999999999],
          [-122.46132999999996, 37.77036],
          [-122.46140999999996, 37.77034999999999],
          [-122.46175999999996, 37.77029999999999],
          [-122.46255999999995, 37.77009999999999],
          [-122.46290999999995, 37.770019999999995],
          [-122.46298999999995, 37.769999999999996],
          [-122.46304999999995, 37.76998999999999],
          [-122.46378999999995, 37.76980999999999],
          [-122.46438999999995, 37.76966999999999],
          [-122.46453999999996, 37.76963999999999],
          [-122.46472999999996, 37.76955999999999],
          [-122.46500999999996, 37.76939999999999],
          [-122.46511999999997, 37.76931999999999],
          [-122.46516699999997, 37.76927799999999],
        ],
      },
    },
    color: "#FD5535",
  },
  {
    id: "R0-S2",
    duration: 100,
    length: 99,
    mode: "pedestrian",
    sectionIndex: 2,
    departureTime: new Date("2024-10-03T15:54:22.000Z"),
    arrivalTime: new Date("2024-10-03T15:56:02.000Z"),
    departure: {
      lat: 37.7693067,
      lng: -122.4652067,
    },
    arrival: {
      lat: 37.7698646,
      lng: -122.4660947,
    },
    polyline: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.465167, 37.769278],
          [-122.46512, 37.76932],
          [-122.46500999999999, 37.7694],
          [-122.46472999999999, 37.76956],
          [-122.46453999999999, 37.769639999999995],
          [-122.46438999999998, 37.76967],
          [-122.46455999999998, 37.76989],
          [-122.46476999999997, 37.77007],
          [-122.46493999999997, 37.77016],
          [-122.46510999999997, 37.770309999999995],
          [-122.46512999999997, 37.770379999999996],
          [-122.46505999999998, 37.77054999999999],
          [-122.46505999999998, 37.77063999999999],
          [-122.46517999999998, 37.77062999999999],
          [-122.46526999999998, 37.77062999999999],
          [-122.46538999999997, 37.77064999999999],
          [-122.46550999999997, 37.77062999999999],
          [-122.46571999999996, 37.77064999999999],
          [-122.46580999999996, 37.770639999999986],
          [-122.46587999999996, 37.770609999999984],
          [-122.46600999999995, 37.77052999999999],
          [-122.46629999999996, 37.770299999999985],
          [-122.46646799999996, 37.77017099999998],
        ],
      },
    },
  },
];
