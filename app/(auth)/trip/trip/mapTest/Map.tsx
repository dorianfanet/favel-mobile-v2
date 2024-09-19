import { TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import MapboxGL from "@rnmapbox/maps";
import {
  bearing,
  booleanPointInPolygon,
  center,
  clustersDbscan,
  distance,
  Feature,
  featureCollection,
  FeatureCollection,
  Geometry,
  LineString,
  point,
  Point,
  polygon,
  Properties,
} from "@turf/turf";
import { bboxToCoordinatesArray } from "@/lib/utils";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import Icon from "@/components/Icon";

const theme = "light";

export default function Map() {
  const mapRef = React.useRef<MapboxGL.MapView>(null);

  const [visiblePoints, setVisiblePoints] = React.useState<Feature[]>([]);
  const [prevZoomLevel, setPrevZoomLevel] = React.useState(0);
  const lastLogTime = React.useRef(Date.now());

  const [isAllSF, setIsAllSF] = React.useState(false);

  React.useEffect(() => {
    setVisiblePoints(data.features);
  }, []);

  const onRegionIsChanging = async () => {
    const currentZoomLevel = await mapRef.current?.getZoom();
    if (!currentZoomLevel) return;
    const roundedZoomLevel = Math.round(currentZoomLevel * 2) / 2;

    const now = Date.now();
    const timeSinceLastLog = now - lastLogTime.current;

    if (roundedZoomLevel !== prevZoomLevel && timeSinceLastLog > 100) {
      // console.log("Zoom level:", roundedZoomLevel);
      setPrevZoomLevel(roundedZoomLevel);
      lastLogTime.current = now;

      clusterPoints();
    }
  };

  const clusterPoints = async () => {
    const bounds = await mapRef.current?.getVisibleBounds();

    // console.log("Bounds:", bounds);

    // calculate distance between east and west points of the bounds using turf
    const southWest = point([bounds[1][0], bounds[1][1]]);
    const southEast = point([bounds[0][0], bounds[1][1]]);

    const visibleDistance = distance(southEast, southWest, {
      units: "kilometers",
    });

    // console.log("Visible distance:", visibleDistance);

    const clusteringResult = clustersDbscan(data, visibleDistance / 3, {
      units: "kilometers",
    });

    // console.log("Clusters:", JSON.stringify(clusteringResult, null, 2));

    const clusters = {};
    const noisePoints: any[] = [];

    clusteringResult.features.forEach((feature) => {
      if (feature.properties.dbscan === "core") {
        const clusterId = feature.properties.cluster;
        if (!clusters[clusterId]) {
          clusters[clusterId] = [];
        }
        clusters[clusterId].push(feature);
      } else if (feature.properties.dbscan === "noise") {
        noisePoints.push(feature);
      }
    });

    // console.log(JSON.stringify(clusters, null, 2));

    // // if clusters length is 7, then all points are in SF
    // if (clusters[0] && clusters[0].length === 7) {
    //   console.log("All points are in SF");
    //   setIsAllSF(true);
    // } else {
    //   console.log("Not all points are in SF");
    //   setIsAllSF(false);
    // }

    // Step 2: Calculate cluster centers
    const clusterCenters = Object.keys(clusters).map((clusterId) => {
      const points = clusters[clusterId].map(
        (feature) => feature.geometry.coordinates
      );
      const centerPoint = center(
        featureCollection(points.map((coord) => point(coord)))
      );

      const daysOfWeek = clusters[clusterId].map(
        (feature) => feature.properties.day_of_week[0]
      );
      const dayNb = clusters[clusterId].map(
        (feature) => feature.properties.day_nb[0]
      );

      // console.log("Days of week:", daysOfWeek);
      const groupedDaysOfWeek = groupConsecutiveNumbers(daysOfWeek);
      // console.log("Grouped days of week:", groupedDaysOfWeek);
      const groupedNbs = groupConsecutiveNumbers(dayNb);

      return point(centerPoint.geometry.coordinates, {
        id: `cluster-${clusterId}-${dayNb.join("-")}`,
        name: "San Francisco",
        day_of_week: groupedDaysOfWeek,
        day_nb: groupedNbs,
        cluster: parseInt(clusterId),
      });
    });

    // Step 3: Create new GeoJSON with cluster centers and noise points
    const result = featureCollection([...clusterCenters, ...noisePoints]);

    // console.log(JSON.stringify(result, null, 2));

    setVisiblePoints(result.features);
  };

  const [lineArrows, setLineArrows] = React.useState<FeatureCollection>(
    featureCollection([])
  );

  useEffect(() => {
    const lineArrows: Feature[] = [];
    // calculate midpoint for each section of the linestring using turf
    stayLines.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      for (let i = 0; i < coords.length - 1; i++) {
        const start = point(coords[i]);
        const end = point(coords[i + 1]);
        const mid = center(featureCollection([start, end]));
        const heading = Math.round(bearing(start, end));

        lineArrows.push({
          type: "Feature",
          properties: {
            id: `arrow-${i}`,
            heading,
          },
          geometry: mid.geometry,
        });
      }
    });

    console.log("Line arrows:", JSON.stringify(lineArrows, null, 2));

    setLineArrows(featureCollection(lineArrows));
  }, []);

  return (
    <MapboxGL.MapView
      ref={mapRef}
      style={{
        flex: 1,
      }}
      rotateEnabled={false}
      pitchEnabled={false}
      projection="globe"
      styleURL="mapbox://styles/mapbox/streets-v12"
      onRegionIsChanging={onRegionIsChanging}
    >
      <MapboxGL.ShapeSource
        id="line2"
        shape={planeLines}
      >
        <MapboxGL.LineLayer
          id="line2"
          style={{
            lineColor: iconColors.plane,
            lineWidth: 15,
            lineDasharray: [1],
            lineBlur: 40,
          }}
        />
        <MapboxGL.LineLayer
          id="line2-"
          style={{
            lineColor: iconColors.plane,
            lineWidth: 2,
            lineDasharray: [1],
            lineBlur: 0,
          }}
        />
      </MapboxGL.ShapeSource>
      <MapboxGL.ShapeSource
        id="line1"
        shape={stayLines}
      >
        <MapboxGL.LineLayer
          id="line1"
          style={{
            lineColor: iconColors.night,
            lineWidth: 12,
            lineDasharray: [1],
            lineBlur: 40,
          }}
        />
        <MapboxGL.LineLayer
          id="line1-"
          style={{
            lineColor: iconColors.night,
            lineWidth: 2,
            lineDasharray: [1],
            lineBlur: 0,
          }}
        />
      </MapboxGL.ShapeSource>

      {lineArrows.features.map((feature) => (
        <MapboxGL.PointAnnotation
          key={feature.properties!.id}
          id={feature.properties!.id}
          coordinate={feature.geometry.coordinates}
        >
          <View
            style={{
              width: 30,
              height: 30,
              // backgroundColor: iconColors.night,
              // transform: [{ rotate: `134deg` }],
              // transform: [{ rotate: `${feature.properties!.heading}deg` }],
            }}
          >
            <View
              style={{
                transform: [{ rotate: `90deg` }],
              }}
            >
              <Icon
                icon="chevronLeftIcon"
                size={30}
                color={iconColors.night}
                style={{
                  transform: [{ rotate: `${feature.properties!.heading}deg` }],
                }}
              />
            </View>
          </View>
        </MapboxGL.PointAnnotation>
      ))}

      {icons.features.map((feature) => (
        <CustomMarker
          key={feature.properties!.id}
          feature={feature}
          isAllInSF={isAllSF}
        />
      ))}

      {!isAllSF &&
        visiblePoints.map((feature) => (
          <MapboxGL.MarkerView
            key={`point-${feature.properties!.id}`}
            id={feature.properties!.name}
            // @ts-ignore
            coordinate={feature.geometry.coordinates}
            allowOverlap={true}
          >
            <View
              style={{
                alignItems: "center",
                shadowColor: Colors.light.primary,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 5,
                elevation: 3,
                // transform: [{ translateY: -35 }],
              }}
            >
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 10,
                  backgroundColor: Colors.dark.primary,
                  borderRadius: 10,
                  padding: 4,
                  paddingHorizontal: 8,
                }}
              >
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: -3,
                  }}
                >
                  <Text
                    style={{
                      color: Colors[theme].primary,
                      fontFamily: "Outfit_600SemiBold",
                      fontSize: 14,
                      textAlign: "center",
                      paddingHorizontal: 0,
                    }}
                  >
                    {feature
                      .properties!.day_nb.map((nb) => {
                        if (Array.isArray(nb)) {
                          return `${nb[0]} > ${nb[1]}`;
                        } else {
                          return nb;
                        }
                      })
                      .join(", ")}
                  </Text>
                  <Text
                    style={{
                      color: Colors[theme].primary,
                      fontFamily: "Outfit_500Medium",
                      fontSize: 10,
                    }}
                  >
                    {feature
                      .properties!.day_of_week.map((nb) => {
                        if (Array.isArray(nb)) {
                          return `${daysOfWeek[nb[0]]} > ${daysOfWeek[nb[1]]}`;
                        } else {
                          return daysOfWeek[nb];
                        }
                      })
                      .join(", ")}
                  </Text>
                </View>
                <View
                  style={
                    {
                      // paddingHorizontal: 10,
                    }
                  }
                >
                  <Text
                    style={{
                      color: Colors[theme].primary,
                      fontFamily: "Outfit_600SemiBold",
                    }}
                  >
                    {feature.properties!.name}
                  </Text>
                </View>
              </TouchableOpacity>
              {/* <View
              style={{
                backgroundColor: "transparent",
                height: 30,
                width: 2,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
            <View
              style={{
                backgroundColor: "white",
                height: 10,
                width: 10,
                borderRadius: 5,
              }}
            /> */}
            </View>
            {/* <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              height: 28,
            }}
          >
            <View
              style={{
                backgroundColor: "#165077",
                justifyContent: "center",
                height: 24,
                paddingHorizontal: 6,
                paddingLeft: 10,
                borderRadius: 5,
                zIndex: 5,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {feature.properties!.name}
              </Text>
            </View>
            <View
              style={{
                height: 28,
                backgroundColor: "white",
                borderRadius: 5,
                marginRight: -5,
                overflow: "hidden",
                zIndex: 10,
                minWidth: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: Colors.light.accent,
                  height: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 10,
                  }}
                >
                  {feature
                    .properties!.day_of_week.map((nb) => {
                      if (Array.isArray(nb)) {
                        return `${daysOfWeek[nb[0]]} > ${daysOfWeek[nb[1]]}`;
                      } else {
                        return daysOfWeek[nb];
                      }
                    })
                    .join(", ")}
                </Text>
              </View>
              <Text
                style={{
                  color: Colors.light.primary,
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 12,
                  textAlign: "center",
                  paddingHorizontal: 4,
                }}
              >
                {feature
                  .properties!.day_nb.map((nb) => {
                    if (Array.isArray(nb)) {
                      return `${nb[0]} > ${nb[1]}`;
                    } else {
                      return nb;
                    }
                  })
                  .join(", ")}
              </Text>
            </View>
          </View> */}
          </MapboxGL.MarkerView>
        ))}
    </MapboxGL.MapView>
  );
}

const iconColors = {
  plane: "#15d790",
  night: "#0c30a5",
};

const iconNames = {
  plane: "planeIcon",
  night: "moonIcon",
};

function CustomMarker({
  feature,
  isAllInSF,
}: {
  feature: Feature;
  isAllInSF: boolean;
}) {
  return (
    <MapboxGL.MarkerView
      key={`point-${feature.properties!.id}`}
      id={feature.properties!.name}
      // @ts-ignore
      coordinate={feature.geometry.coordinates}
      allowOverlap={true}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconColors[feature.properties!.type as string],
          justifyContent: "center",
          alignItems: "center",
          shadowColor: iconColors[feature.properties!.type as string],
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Icon
          icon={iconNames[feature.properties!.type as string]}
          size={24}
          color="white"
        />
        {feature.properties!.type === "night" ? (
          <Text
            style={{
              position: "absolute",
              top: 2,
              right: 5,
              color: "white",
            }}
          >
            6
          </Text>
        ) : null}
      </View>
      {feature.properties.id === "1" && isAllInSF ? (
        <View
          style={{
            position: "absolute",
            left: 45,
          }}
        >
          <View
            style={{
              alignItems: "center",
              shadowColor: Colors.light.primary,
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 5,
              elevation: 3,
              // transform: [{ translateY: -35 }],
            }}
          >
            <TouchableOpacity
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: 10,
                backgroundColor: Colors.dark.primary,
                borderRadius: 10,
                padding: 4,
                paddingHorizontal: 8,
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: -3,
                }}
              >
                <Text
                  style={{
                    color: Colors[theme].primary,
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 14,
                    textAlign: "center",
                    paddingHorizontal: 0,
                  }}
                >
                  {"12 > 18"}
                </Text>
                <Text
                  style={{
                    color: Colors[theme].primary,
                    fontFamily: "Outfit_500Medium",
                    fontSize: 10,
                  }}
                >
                  {"Mon > Sun"}
                </Text>
              </View>
              <View
                style={
                  {
                    // paddingHorizontal: 10,
                  }
                }
              >
                <Text
                  style={{
                    color: Colors[theme].primary,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  San Francisco
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </MapboxGL.MarkerView>
  );
}

const icons: FeatureCollection<Point, Properties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "1",
        type: "night",
      },
      geometry: {
        type: "Point",
        coordinates: [-122.43338013280334, 37.75303331316704],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "2",
        type: "night",
      },
      geometry: {
        type: "Point",
        coordinates: [-121.8845742153606, 37.336523909616204],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3",
        type: "plane",
      },
      geometry: {
        type: "Point",
        coordinates: [-122.38173112540684, 37.622033623878266],
      },
    },
  ],
};

const stayLines: FeatureCollection<LineString, Properties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        stroke: "#000000",
        "stroke-width": 2,
      },
      geometry: {
        coordinates: [
          [-122.38172754235435, 37.621825808229715],
          [-122.43338013280334, 37.75303331316704],
          [-121.8845742153606, 37.336523909616204],
          [-122.38142611233764, 37.620568273181945],
        ],
        type: "LineString",
      },
    },
  ],
};

const planeLines: FeatureCollection<LineString, Properties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        coordinates: [
          [2.556294439512129, 49.006735081152726],
          [-122.38173112540684, 37.622033623878266],
        ],
        type: "LineString",
      },
    },
  ],
};

const data: FeatureCollection<
  Point,
  {
    name: string;
    id: string;
    day_of_week: number[];
    day_nb: number[];
  }
> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "0",
        name: "Fisherman's Wharf",
        day_of_week: [0],
        day_nb: [12],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4165, 37.808],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "1",
        name: "Chinatown",
        day_of_week: [1],
        day_nb: [13],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4064, 37.7941],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "2",
        name: "Union Square",
        day_of_week: [2],
        day_nb: [14],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4075, 37.7879],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "3",
        name: "North Beach",
        day_of_week: [3],
        day_nb: [15],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4105, 37.8061],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "4",
        name: "Haight-Ashbury",
        day_of_week: [4],
        day_nb: [16],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4462, 37.7694],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "5",
        name: "Golden Gate Park",
        day_of_week: [5],
        day_nb: [17],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4869, 37.7694],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "6",
        name: "Mission District",
        day_of_week: [6],
        day_nb: [18],
      },
      geometry: {
        type: "Point",
        coordinates: [-122.4194, 37.7599],
      },
    },
  ],
};

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function groupConsecutiveNumbers(arr: number[]): (number | [number, number])[] {
  if (arr.length === 0) return [];

  // Sort the array to ensure numbers are in order
  arr.sort((a, b) => a - b);

  const result: (number | [number, number])[] = [];
  let group: number[] = [arr[0]];

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1] + 1) {
      // Current number is consecutive, add it to the current group
      group.push(arr[i]);
    } else {
      // Current number is not consecutive
      // Check if we have a group of more than 1 number
      if (group.length > 1) {
        result.push([group[0], group[group.length - 1]]);
      } else {
        result.push(group[0]);
      }
      // Start a new group
      group = [arr[i]];
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
