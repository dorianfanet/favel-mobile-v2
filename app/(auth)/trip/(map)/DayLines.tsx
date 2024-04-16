import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MapboxGL, { MarkerView } from "@rnmapbox/maps";
import {
  BBox,
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Position,
  bbox,
  center,
  lineString,
  point,
  points,
} from "@turf/turf";
import { useTrip } from "@/context/tripContext";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "@/components/Themed";
import { useEditor } from "@/context/editorContext";
import ImageWithFallback from "@/components/ImageWithFallback";
import Icon from "@/components/Icon";
import { categories, colors as categoryColor } from "@/constants/categories";
import { Category } from "@/types/types";
import { AnimatePresence, MotiView } from "moti";

export default function DayLines() {
  const { trip } = useTrip();

  const { setEditor, editor } = useEditor();

  const [dayLines, setDayLines] =
    useState<GeoJSON.FeatureCollection<GeoJSON.LineString> | null>(null);

  useEffect(() => {
    if (!trip) return;

    let tempFeatureColletion: GeoJSON.FeatureCollection<GeoJSON.LineString> = {
      type: "FeatureCollection",
      features: [],
    };

    // trip.forEach((day, index) => {
    // let tempCoordinates: Position[] = [];

    // if (day.type === "day" && day.activities && day.activities.length > 1) {
    //   let feature: GeoJSON.Feature<LineString> = {
    //     type: "Feature",
    //     properties: {
    //       id: day.id,
    //       opacity: editor
    //         ? editor.type === "day" && editor.day.id === day.id
    //           ? 1
    //           : 0.3
    //         : 1,
    //     },
    //     geometry: {
    //       type: "LineString",
    //       coordinates: tempCoordinates,
    //     },
    //   };

    //   day.activities.forEach((activity) => {
    //     if (
    //       activity.coordinates &&
    //       activity.coordinates.latitude &&
    //       activity.coordinates.longitude
    //     ) {
    //       // @ts-ignore
    //       tempCoordinates.push([
    //         activity.coordinates.longitude,
    //         activity.coordinates.latitude,
    //       ]);
    //     }
    //   });

    //   tempFeatureColletion.features.push(feature);
    // }
    // });

    // create line only for the day of the editor
    if (editor) {
      const day = trip.find((day) =>
        editor.type === "day"
          ? day.id === editor.day.id
          : editor.type === "activity"
          ? day.id === editor.dayId
          : undefined
      );

      if (day) {
        let tempCoordinates: Position[] = [];

        if (day.type === "day" && day.activities && day.activities.length > 1) {
          let feature: GeoJSON.Feature<LineString> = {
            type: "Feature",
            properties: {
              id: day.id,
              opacity: 1,
            },
            geometry: {
              type: "LineString",
              coordinates: tempCoordinates,
            },
          };

          day.activities.forEach((activity) => {
            if (
              activity.coordinates &&
              activity.coordinates.latitude &&
              activity.coordinates.longitude
            ) {
              // @ts-ignore
              tempCoordinates.push([
                activity.coordinates.longitude,
                activity.coordinates.latitude,
              ]);
            }
          });

          tempFeatureColletion.features.push(feature);
        }
      }
    }

    setDayLines(tempFeatureColletion);
  }, [trip, editor]);

  const dayLabels = useMemo(() => {
    if (!trip) return;

    const tempFeatures: {
      coordinates: Position;
      bounds: BBox;
      index: number;
      id: string;
    }[] = [];

    trip.forEach((day, index) => {
      try {
        if (day.activities && day.activities.length > 1 && day.type === "day") {
          const noRouteActivities = day.activities?.filter(
            (activity) => activity.type !== "route"
          );

          const pointsOfDay: Position[] = [];

          noRouteActivities.map((activity) => {
            if (activity.coordinates) {
              pointsOfDay.push([
                activity.coordinates.longitude,
                activity.coordinates.latitude,
              ]);
            }
          });

          const features = points(pointsOfDay);
          const centerPoint = center(features);

          const line = lineString(pointsOfDay);
          const bounds = bbox(line);

          tempFeatures.push({
            coordinates: centerPoint.geometry.coordinates,
            bounds: bounds,
            index: index,
            id: day.id!,
          });
        }
      } catch (e) {
        console.log(e);
      }
    });

    return tempFeatures;
  }, [trip]);

  const dayMarkerData = useMemo(() => {
    const icons: Category[][] | undefined = [];
    const images: string[][] = [];
    trip?.forEach((day, index) => {
      icons.push([]);
      images.push([]);
      day.activities?.forEach((activity) => {
        if (activity.category) {
          icons[index].push(activity.category as Category);
        }
        if (activity.id) {
          images[index].push(activity.id);
        }
      });
    });

    return {
      icons,
      images,
    };
  }, [trip]);

  return dayLines ? (
    <>
      <MapboxGL.ShapeSource
        id="dayLines"
        shape={dayLines}
      >
        <MapboxGL.LineLayer
          id="dayLinesLayer"
          style={{
            lineColor: "rgba(34, 52, 104, 1)",
            lineWidth: 3,
            lineCap: MapboxGL.LineJoin.Round,
            lineJoin: MapboxGL.LineJoin.Round,
            lineOpacity: ["get", "opacity"],
          }}
        />
      </MapboxGL.ShapeSource>
      {dayLabels &&
        dayLabels.map((label, index) => (
          <>
            <MarkerView
              key={`day-label-${index}`}
              id={`label-${index}`}
              coordinate={label.coordinates}
              allowOverlap={true}
            >
              <>
                {trip && (
                  <Pressable
                    onPress={() => {
                      setEditor({
                        type: "day",
                        day: {
                          center: label.coordinates,
                          bounds: label.bounds,
                          id: label.id,
                        },
                      });
                    }}
                  >
                    <DayMarkerMemo
                      name={`Jour ${label.index + 1}`}
                      // images should be an array of the ids of the activities of that day
                      images={dayMarkerData.images[label.index]}
                      icons={dayMarkerData.icons[label.index]}
                      editor={editor ? true : false}
                    />
                  </Pressable>
                )}
              </>
            </MarkerView>
          </>
        ))}
    </>
  ) : null;
}

const DayMarkerMemo = React.memo(DayMarker);

function DayMarker({
  name,
  images,
  // onPress,
  icons,
  editor,
}: {
  name: string;
  images: (string | undefined)[] | undefined;
  // onPress: () => void;
  icons?: Category[];
  editor: boolean;
}) {
  console.log("DayMarker render");

  return (
    // <Pressable onPress={onPress}>
    <View
      style={{
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        // width: 55,
        // height: 85,
      }}
    >
      <View
        style={{
          // position: "absolute",
          top: 0,
        }}
      >
        <MotiView
          animate={{
            scale: editor ? 0 : 1,
          }}
          transition={{
            type: "timing",
            duration: 200,
            delay: 0,
          }}
          style={[
            {
              width: 75,
              height: 75,
              transformOrigin: "bottom",
            },
          ]}
        >
          <Icon
            icon="activitiesMapPin"
            size={75}
            color={"#205783"}
          />
          <View
            style={{
              position: "absolute",
              top: 5,
              left: 5,
              width: 55,
              height: 55,
              borderRadius: 50,
              marginHorizontal: 5,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {images && images.length > 0 && (
              // <Image
              //   style={{ width: "100%", height: "100%", borderRadius: 50 }}
              //   source={{
              //     uri: `https://storage.googleapis.com/favel-photos/activites/${images[currentImageIndex]}-700.jpg`,
              //   }}
              //   // fallbackSource={require("@/assets/images/no-image.png")}
              // />
              <DayMarkerImage
                images={images}
                editor={editor}
              />
            )}
          </View>
        </MotiView>
      </View>
      <MotiView
        animate={{
          opacity: editor ? 0 : 1,
        }}
        transition={{
          type: "timing",
          duration: 200,
          delay: 0,
        }}
      >
        <View
          style={{
            // position: "absolute",
            // top: 65,
            maxWidth: 150,
          }}
        >
          <View
            style={[
              {
                backgroundColor: "#205783",
                // backgroundColor: "#426682",
                borderRadius: 7,
                padding: 2,
                paddingHorizontal: 4,
                alignSelf: "center",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 12,
                color: "white",
                fontFamily: "Outfit_600SemiBold",
                textAlign: "center",
              }}
            >
              {name}
            </Text>
          </View>
        </View>
        <View
          style={{
            // position: "absolute",
            // top: 0,
            // right: 0,
            flexDirection: "row",
            marginTop: 5,
            gap: -5,
          }}
        >
          {icons &&
            icons.length > 0 &&
            icons.map((icon) => <ActivityIcon icon={icon} />)}
        </View>
      </MotiView>
    </View>
    // </Pressable>
  );
}

function ActivityIcon({ icon }: { icon: Category }) {
  return (
    <View
      style={{
        backgroundColor: categoryColor[icon] || categoryColor.unknown,
        width: 24,
        height: 24,
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Icon
        icon={`${categories.includes(icon) ? icon : "unknown"}Icon`}
        size={14}
        color={"white"}
      />
    </View>
  );
}

const DayMarkerImageMemo = React.memo(DayMarkerImage);

function DayMarkerImage({
  images,
  editor,
}: {
  images: (string | undefined)[];
  editor: boolean;
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const errorCountr = useRef(0);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    errorCountr.current = 0;
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      const random = Math.floor(Math.random() * (images.length - 1));
      console.log("editor updated", random);
      console.log("image", images[random]);
      setCurrentImageIndex(random);
    }
  }, [editor, images]);

  return (
    <Image
      key={images[currentImageIndex]}
      style={{ width: "100%", height: "100%", borderRadius: 50 }}
      source={{
        uri: isError
          ? require("@/assets/images/no-image.png")
          : `https://storage.googleapis.com/favel-photos/activites/${images[currentImageIndex]}-700.jpg`,
      }}
      onError={() => {
        if (errorCountr.current < images.length) {
          setCurrentImageIndex((prev) =>
            prev < images.length - 1 ? prev + 1 : 0
          );
        } else {
          setIsError(true);
        }
        errorCountr.current++;
      }}
    />
  );
}
