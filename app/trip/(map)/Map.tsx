import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useCamera } from "@/context/cameraContext";
import MapView from "@/components/Map/MapView";
import Mapbox, { MarkerView } from "@rnmapbox/maps";
import Days from "./Days";
import { useTrip } from "@/context/tripContext";
import { TripDay } from "@/types/trip";
import Colors from "@/constants/Colors";
import { format } from "date-fns";
import useTheme from "@/hooks/useTheme";
import { Svg, Text as SvgText } from "react-native-svg";
import {
  booleanPointInPolygon,
  buffer,
  center,
  clustersDbscan,
  convex,
  distance,
  Feature,
  FeatureCollection,
  featureCollection,
  LineString,
  point,
  Point,
  Polygon,
  Properties,
} from "@turf/turf";
import { Text, View } from "@/components/Themed";
import Icon from "@/components/Icon";
import * as _ from "lodash";

const roundToNearestHalf = (value: number) => {
  return Math.round(value * 2) / 2;
};

interface MapTripDay {
  id: string;
  name?: string;
  centerPoint: {
    lat: number;
    lng: number;
  };
  dayIds: string[];
  dates: (Date | [Date, Date])[];
}

export default function Map() {
  const {
    easing,
    padding,
    zoom,
    minZoom,
    maxZoom,
    centerOrBounds,
    animationDuration,
  } = useCamera();

  const mapRef = useRef<Mapbox.MapView>(null);

  const [prevZoomLevel, setPrevZoomLevel] = useState(0);
  const lastLogTime = useRef(Date.now());

  const checkVisibleDays = useCallback(
    _.throttle(async () => {
      const bounds = await mapRef.current?.getVisibleBounds();
      if (!bounds) return;

      // convert bounds from [Position, Position] to Polygon
      const polygon: Polygon = {
        type: "Polygon",
        coordinates: [
          [
            [bounds[0][0], bounds[0][1]],
            [bounds[1][0], bounds[0][1]],
            [bounds[1][0], bounds[1][1]],
            [bounds[0][0], bounds[1][1]],
            [bounds[0][0], bounds[0][1]],
          ],
        ],
      };

      // check how many days are visible in the current view
      const visibleDays = days?.features.filter((day) => {
        const dayPoint = point([
          day.properties.centerPoint.lng,
          day.properties.centerPoint.lat,
        ]);
        return booleanPointInPolygon(dayPoint, polygon);
      });

      if (
        visibleDays &&
        visibleDays.length === 1 &&
        visibleDays[0].properties.dayIds.length === 1
      ) {
        console.log("View mode: ", visibleDays[0].properties.name);
      } else {
        console.log("View mode: San Francisco");
      }

      // // log timestamp
      console.log("Timestamp: ", new Date().toISOString());
    }, 500),
    []
  );

  const onRegionIsChanging = async () => {
    const currentZoomLevel = await mapRef.current?.getZoom();
    const roundedZoomLevel = roundToNearestHalf(currentZoomLevel!);

    // Debounce mechanism to avoid logging the same zoom level in quick succession
    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;

    if (roundedZoomLevel !== prevZoomLevel && timeSinceLastLog > 100) {
      // 100 ms debounce
      // console.log("Zoom level:", roundedZoomLevel);
      setPrevZoomLevel(roundedZoomLevel);
      lastLogTime.current = now; // Update last log time

      clusterDays();
    }

    // checkVisibleDays();
  };

  const { state } = useTrip();

  const [days, setDays] = React.useState<
    FeatureCollection<Point, MapTripDay> | undefined
  >(undefined);

  const ogGeojsonDays: FeatureCollection<Point, MapTripDay> = useMemo(() => {
    return featureCollection(
      state.days.map((day) =>
        point<MapTripDay>([day.centerPoint.lng, day.centerPoint.lat], {
          id: day.id,
          name: day.name,
          centerPoint: {
            lat: day.centerPoint.lat,
            lng: day.centerPoint.lng,
          },
          dayIds: [day.id],
          dates: [day.date],
        })
      )
    );
  }, [state.days]);

  useEffect(() => {
    setDays(ogGeojsonDays);
  }, [ogGeojsonDays]);

  const dayPolygons: FeatureCollection<Polygon, Properties> = useMemo(() => {
    if (days) {
      const convexs: (Feature<Polygon, Properties> | null)[] =
        days?.features.map((day) => {
          const dayEvent = state.events.filter((event) =>
            day.properties.dayIds.includes(event.dayId)
          );
          return convex({
            type: "Feature",
            properties: {},
            geometry: {
              type: "MultiPoint",
              coordinates: dayEvent.map((event) => [
                event.centerPoint.lng,
                event.centerPoint.lat,
              ]),
            },
          });
        });

      // return convexs as Feature<Polygon, Properties>[];
      const result = convexs.map((polygon) => {
        return buffer(polygon!, 0.5, { units: "kilometers" });
      });

      return featureCollection(result);
    } else {
      return featureCollection([]);
    }
  }, [days]);

  const { invertedTheme, theme } = useTheme();

  async function clusterDays() {
    const bounds = await mapRef.current?.getVisibleBounds();
    if (!bounds) return;

    const sw = [bounds[0][0], bounds[0][1]];
    const se = [bounds[1][0], bounds[0][1]];

    const mapWidth = distance(sw, se, { units: "kilometers" });

    // console.log("Map width", mapWidth);

    const clustered = clustersDbscan(ogGeojsonDays, mapWidth / 4, {
      units: "kilometers",
    });

    // console.log("Clustered", JSON.stringify(clustered, null, 2));

    const clusters: { [key: string]: string[] } = {};
    const noisePoints: string[] = [];

    clustered.features.forEach((feature) => {
      if (feature.properties.cluster !== undefined) {
        const clusterId = feature.properties.cluster;
        if (!clusters[clusterId]) {
          clusters[clusterId] = feature.properties.dayIds;
        } else {
          clusters[clusterId].push(...feature.properties.dayIds);
        }
      } else {
        noisePoints.push(feature.properties.id);
      }
    });

    const clusterPoints: Feature<Point, MapTripDay>[] = Object.keys(
      clusters
    ).map((key) => {
      const cluster = clusters[key];
      const points = cluster.map((dayId) => {
        const day = state.days.find((d) => d.id === dayId);
        return point([day!.centerPoint.lng, day!.centerPoint.lat], {
          id: dayId,
          name: day!.name,
          centerPoint: {
            lat: day!.centerPoint.lat,
            lng: day!.centerPoint.lng,
          },
          dayIds: [dayId],
          dates: [day!.date],
        });
      });

      const centerPoint = center(featureCollection(points));
      return point(centerPoint.geometry.coordinates, {
        id: `cluster-${key}`,
        date: new Date(),
        centerPoint: {
          lat: centerPoint.geometry.coordinates[1],
          lng: centerPoint.geometry.coordinates[0],
        },
        dayIds: cluster,
        dates: groupConsecutiveDates(
          cluster.map((dayId) => {
            const day = state.days.find((d) => d.id === dayId);
            return day!.date;
          })
        ),
      });
    });

    const noisePointsFeatures: Feature<Point, MapTripDay>[] = noisePoints.map(
      (dayId) => {
        const day = state.days.find((d) => d.id === dayId);
        return point([day!.centerPoint.lng, day!.centerPoint.lat], {
          id: dayId,
          name: day!.name,
          centerPoint: {
            lat: day!.centerPoint.lat,
            lng: day!.centerPoint.lng,
          },
          dayIds: [dayId],
          dates: [day!.date],
        });
      }
    );

    const newFeatures = clusterPoints.concat(noisePointsFeatures);

    setDays(featureCollection(newFeatures));
  }

  return (
    <MapView
      mapRef={mapRef}
      easing={easing}
      padding={padding}
      zoom={zoom}
      minZoom={minZoom}
      maxZoom={maxZoom}
      centerOrBounds={centerOrBounds}
      animationDuration={animationDuration}
      onCameraChanged={onRegionIsChanging}
    >
      <Mapbox.ShapeSource
        id="days"
        shape={days}
      >
        <Mapbox.SymbolLayer
          id="days"
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
      <Mapbox.ShapeSource
        id="dayPolygons"
        shape={dayPolygons}
      >
        <Mapbox.FillLayer
          id="dayPolygons"
          style={{
            fillColor: Colors[theme].accent,
            fillOpacity: 0.2,
          }}
        />
        <Mapbox.LineLayer
          id="dayPolygonsOutline"
          style={{
            lineColor: Colors[theme].accent,
            lineWidth: 2,
          }}
        />
      </Mapbox.ShapeSource>
      {days
        ? days.features.map((day) => (
            <MarkerView
              key={day.id}
              coordinate={[
                day.properties.centerPoint.lng,
                day.properties.centerPoint.lat,
              ]}
              allowOverlap={true}
            >
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  {day.properties.dates.map((date) =>
                    Array.isArray(date) ? (
                      <View
                        key={date[0].toISOString()}
                        style={{
                          flexDirection: "row-reverse",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: -5,
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            padding: 5,
                            borderRadius: 13,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: Colors[invertedTheme].text.primary,
                            borderWidth: 1.5,
                            borderColor: Colors[theme].background.primary,
                            shadowColor: Colors[theme].background.primary,
                            shadowOffset: {
                              width: 0,
                              height: 0,
                            },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 20,
                            gap: -3,
                          }}
                        >
                          <Text
                            fontStyle="caption"
                            style={{
                              color: Colors[theme].accent,
                              fontFamily: "Outfit_500Medium",
                            }}
                          >
                            {format(date[1], "EEE")}
                          </Text>
                          <Text fontStyle="subtitle">
                            {format(date[1], "dd")}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: 40,
                            height: 40,
                            padding: 5,
                            borderRadius: 13,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: Colors[invertedTheme].text.primary,
                            borderWidth: 1.5,
                            borderColor: Colors[theme].background.primary,
                            shadowColor: Colors[theme].background.primary,
                            shadowOffset: {
                              width: 0,
                              height: 0,
                            },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 20,
                            gap: -3,
                          }}
                        >
                          <Text
                            fontStyle="caption"
                            style={{
                              color: Colors[theme].accent,
                              fontFamily: "Outfit_500Medium",
                            }}
                          >
                            {format(date[0], "EEE")}
                          </Text>
                          <Text fontStyle="subtitle">
                            {format(date[0], "dd")}
                          </Text>
                        </View>
                        <View
                          style={{
                            position: "absolute",
                            left: 24,
                            transform: [{ rotate: "180deg" }],
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Icon
                            icon="chevronLeftIcon"
                            size={24}
                            color={Colors[theme].accent}
                          />
                        </View>
                      </View>
                    ) : (
                      <View
                        key={date.toISOString()}
                        style={{
                          width: 40,
                          height: 40,
                          padding: 5,
                          borderRadius: 13,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: Colors[invertedTheme].text.primary,
                          borderWidth: 1.5,
                          borderColor: Colors[theme].background.primary,
                          shadowColor: Colors[theme].background.primary,
                          shadowOffset: {
                            width: 0,
                            height: 0,
                          },
                          shadowOpacity: 0.5,
                          shadowRadius: 10,
                          elevation: 20,
                          gap: -3,
                        }}
                      >
                        <Text
                          fontStyle="caption"
                          style={{
                            color: Colors[theme].accent,
                            fontFamily: "Outfit_500Medium",
                          }}
                        >
                          {format(date, "EEE")}
                        </Text>
                        <Text fontStyle="subtitle">{format(date, "dd")}</Text>
                      </View>
                    )
                  )}
                </View>
                {day.properties.name ? (
                  <View
                    style={{
                      position: "absolute",
                      left: -80,
                      top: 40,
                      width: 200,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Svg
                      height="60"
                      width="140"
                    >
                      <SvgText
                        fill="none"
                        stroke={Colors[theme].background.secondary}
                        strokeWidth={2}
                        fontSize="14"
                        x="70"
                        y="20"
                        textAnchor="middle"
                        fontFamily="Outfit_500Medium"
                      >
                        {getTextWidth(day.properties.name, 14)}
                      </SvgText>
                      <SvgText
                        fill={Colors[theme].text.primary}
                        fontSize="14"
                        x="70"
                        y="20"
                        textAnchor="middle"
                        fontFamily="Outfit_500Medium"
                      >
                        {getTextWidth(day.properties.name, 14)}
                      </SvgText>
                    </Svg>
                  </View>
                ) : null}
              </View>
            </MarkerView>
          ))
        : null}
    </MapView>
  );
}

function getTextWidth(text: string, fontSize: number) {
  const fontWidth = text.length * fontSize;

  if (fontWidth > 250) {
    return text.slice(0, 18) + "...";
  } else {
    return text;
  }
}

function groupConsecutiveDates(arr: Date[]): (Date | [Date, Date])[] {
  if (arr.length === 0) return [];

  // Sort the dates in ascending order
  arr.sort((a, b) => a.getTime() - b.getTime());

  const result: (Date | [Date, Date])[] = [];
  let group: Date[] = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    const prevDate = arr[i - 1];
    const currDate = arr[i];

    // Calculate the difference in days between two dates
    const dayDifference =
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      // If the difference is exactly one day, it's consecutive
      group.push(currDate);
    } else {
      // If not consecutive, add the group to the result
      if (group.length > 1) {
        result.push([group[0], group[group.length - 1]]);
      } else {
        result.push(group[0]);
      }
      // Start a new group with the current date
      group = [currDate];
    }
  }

  // Handle the last group
  if (group.length > 1) {
    result.push([group[0], group[group.length - 1]]);
  } else {
    result.push(group[0]);
  }

  return result;
}
