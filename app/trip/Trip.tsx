import React from "react";
import MapView from "@/components/Map/MapView";
import { useCamera } from "@/context/cameraContext";
import Mapbox from "@rnmapbox/maps";
import Map from "./Map";
import { BackgroundView, Text, View } from "@/components/Themed";
import MaskedView from "@react-native-masked-view/masked-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { padding } from "@/constants/values";
import { Circle, Defs, Line, Rect, Svg } from "react-native-svg";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Header from "./Header";
import Colors from "@/constants/Colors";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedSensor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const cities = [
  {
    id: "1",
    title: "San Francisco",
    coordinates: [-122.44568711140383, 37.772400367673626],
  },
  {
    id: "2",
    title: "San Joe",
    coordinates: [-121.8863, 37.3382],
  },
  {
    id: "3",
    title: "San Diego",
    coordinates: [-117.1611, 32.7157],
  },
];

const activitiesList = [
  {
    dayId: "1",
    title: "Golden Gate Bridge",
    coordinates: [-122.4786, 37.8199],
  },
  {
    dayId: "1",
    title: "Fisherman's Wharf",
    coordinates: [-122.4176, 37.808],
  },
  {
    dayId: "1",
    title: "Alcatraz Island",
    coordinates: [-122.423, 37.8267],
  },
  {
    dayId: "2",
    title: "San Jose Museum of Art",
    coordinates: [-121.8863, 37.3382],
  },
  {
    dayId: "2",
    title: "Winchester Mystery House",
    coordinates: [-121.9516, 37.3187],
  },
  {
    dayId: "2",
    title: "The Tech Interactive",
    coordinates: [-121.8922, 37.3317],
  },
  {
    dayId: "3",
    title: "San Diego Zoo",
    coordinates: [-117.1523, 32.7157],
  },
  {
    dayId: "3",
    title: "USS Midway Museum",
    coordinates: [-117.1733, 32.7139],
  },
  {
    dayId: "3",
    title: "Balboa Park",
    coordinates: [-117.1531, 32.7317],
  },
];

export default function Trip() {
  const [city, setCity] = React.useState(0);
  const [activity, setActivity] = React.useState(0);
  const [activities, setActivities] = React.useState(
    activitiesList.filter((a) => a.dayId === cities[city].id)
  );

  React.useEffect(() => {
    setActivities(activitiesList.filter((a) => a.dayId === cities[city].id));
  }, [city]);

  const theme = useColorScheme();

  const { move, updatePadding } = useCamera();

  React.useEffect(() => {
    updatePadding({
      paddingTop: 100,
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: 100,
    });
  }, []);

  const onSwipe = (direction: "left" | "right") => {
    // Handle swipe navigation here
    console.log(`Swiped ${direction}`);
  };

  const onTap = (side: "left" | "right") => {
    // Handle tap navigation here
    console.log(`Tapped ${side} side`);
  };

  // Define a pan gesture for swipe detection
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX > 50) {
        onSwipe("right");
      } else if (event.translationX < -50) {
        onSwipe("left");
      }
    })
    .onEnd(() => {
      // Reset or finalize any state after the swipe ends
    })
    .runOnJS(true); // Run on JS thread if needed

  // Tap gesture for left side
  const tapLeftGesture = Gesture.Tap()
    .onEnd(() => {
      onTap("left");
    })
    .runOnJS(true); // Run on JS thread if needed

  // Tap gesture for right side
  const tapRightGesture = Gesture.Tap()
    .onEnd(() => {
      onTap("right");
    })
    .runOnJS(true); // Run on JS thread if needed

  // Composing the gestures
  const composedGesture = Gesture.Race(
    panGesture,
    Gesture.Simultaneous(
      tapLeftGesture.onTouchesDown((event) => {
        if (event.allTouches[0].x < width / 2) {
          onTap("left");
        }
      }),
      tapRightGesture.onTouchesDown((event) => {
        if (event.allTouches[0].x >= width / 2) {
          onTap("right");
        }
      })
    )
  );

  // const

  return (
    // <GestureDetector gesture={composedGesture}>
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          pointerEvents: "none",
        }}
      >
        <Map />
      </View>
      <Header>
        <View
          style={{
            flex: 1,
            paddingHorizontal: padding,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 15,
              paddingVertical: 10,
            }}
          >
            {activities.map((_, i) =>
              i === activity ? (
                <PageIndicator
                  key={`current-${i}`}
                  theme={theme!}
                  onNext={() => {
                    setActivity((prev) =>
                      Math.min(activities.length - 1, prev + 1)
                    );
                    if (activity === activities.length - 1) {
                      setCity((prev) => Math.max(0, prev + 1));
                      setActivity(0);
                      move({
                        coordinates: [
                          {
                            latitude: cities[city + 1].coordinates[1],
                            longitude: cities[city + 1].coordinates[0],
                          },
                        ],
                        customZoom: 10,
                        customEasing: "flyTo",
                      });
                    } else {
                      move({
                        coordinates: [
                          {
                            latitude: activities[activity + 1].coordinates[1],
                            longitude: activities[activity + 1].coordinates[0],
                          },
                        ],
                        customZoom: 13,
                        customEasing: "easeTo",
                      });
                    }
                  }}
                />
              ) : (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 5,
                    backgroundColor: Colors[theme!].text.primary,
                    opacity: i <= activity ? 1 : 0.2,
                  }}
                />
              )
            )}
          </View>
          <Text
            fontStyle="subtitle"
            style={{
              textAlign: "left",
            }}
          >
            {activities[activity].title}
          </Text>
        </View>
      </Header>
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          flexDirection: "row",
        }}
      >
        <Pressable
          onPress={() => {
            setActivity((prev) => Math.max(0, prev - 1));
            // if reached the first activity, move to the previous city
            if (activity === 0) {
              setCity((prev) => Math.min(cities.length - 1, prev - 1));
              setActivity(
                activitiesList.filter((a) => a.dayId === cities[city].id)
                  .length - 1
              );
              move({
                coordinates: [
                  {
                    latitude: cities[city - 1].coordinates[1],
                    longitude: cities[city - 1].coordinates[0],
                  },
                ],
                customZoom: 10,
                customEasing: "flyTo",
              });
            } else {
              move({
                coordinates: [
                  {
                    latitude: activities[activity - 1].coordinates[1],
                    longitude: activities[activity - 1].coordinates[0],
                  },
                ],
                customZoom: 13,
                customEasing: "easeTo",
              });
            }
          }}
          style={{
            flex: 1,
            flexGrow: 2,
          }}
        />
        <Pressable
          onPress={() => {
            setActivity((prev) => Math.min(activities.length - 1, prev + 1));
            // if reached the last activity, move to the next city
            if (activity === activities.length - 1) {
              setCity((prev) => Math.max(0, prev + 1));
              setActivity(0);
              move({
                coordinates: [
                  {
                    latitude: cities[city + 1].coordinates[1],
                    longitude: cities[city + 1].coordinates[0],
                  },
                ],
                customZoom: 10,
                customEasing: "flyTo",
              });
            } else {
              move({
                coordinates: [
                  {
                    latitude: activities[activity + 1].coordinates[1],
                    longitude: activities[activity + 1].coordinates[0],
                  },
                ],
                customZoom: 13,
                customEasing: "easeTo",
              });
            }
          }}
          style={{
            flex: 1,
            flexGrow: 3,
          }}
        />
      </View>
    </View>
    // </GestureDetector>
  );
}

function PageIndicator({
  theme,
  onNext,
}: {
  theme: "light" | "dark";
  onNext?: () => void;
}) {
  const [viewWidth, setViewWidth] = React.useState(0);

  const width = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: width.value,
    };
  });

  React.useEffect(() => {
    width.value = withTiming(viewWidth, {
      duration: 5000,
      easing: Easing.linear,
    });
    // call onNext when the animation is finished
    const timeout = setTimeout(() => {
      if (onNext) {
        onNext();
      }
    }, 5000);
    return () => clearTimeout(timeout);
    // width.value = withTiming(viewWidth, {
    //   duration: 10000,
    //   easing: Easing.linear,
    // });
    // // call onNext when the animation is finished
    // if (onNext) {
    //   setTimeout(onNext, 10000);
    // }
  }, [viewWidth]);

  return (
    <View
      style={{
        flex: 1,
        height: 4,

        borderRadius: 5,
      }}
      onLayout={(event) => {
        setViewWidth(event.nativeEvent.layout.width);
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 5,
          backgroundColor: Colors[theme!].text.primary,
          opacity: 0.2,
        }}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            borderRadius: 5,
            backgroundColor: Colors[theme!].text.primary,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
