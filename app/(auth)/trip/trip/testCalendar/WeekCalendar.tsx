import { Text } from "@/components/Themed";
import { padding } from "@/constants/values";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  Alert,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureType,
  HandlerStateChangeEvent,
  PanGestureHandler,
  PanGestureHandlerEventPayload,
  State,
} from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import OutsidePressHandler from "react-native-outside-press";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import ImageWithFallback from "@/components/ImageWithFallback";
import { LinearGradient } from "expo-linear-gradient";
import { categories } from "@/constants/categories";
import Icon from "@/components/Icon";
import MaskedView from "@react-native-masked-view/masked-view";

const { width, height } = Dimensions.get("screen");

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const hourHeight = 100;
const masterIncrement = 15;
const masterMinimumTime = 30;

const Event = ({ calendarEvent, onDragFinished }) => {
  // Shared value to hold the Y position
  // const translateY = useSharedValue(event.start * 50);

  // // Use Animated Gesture Handler to manage the drag state
  // const panGesture = Gesture.Pan()
  //   .onStart(() => {
  //     // Handler for the gesture start event
  //   })
  //   .onUpdate((event) => {
  //     // Update the translation based on the gesture
  //     translateY.value = event.translationY;
  //   })
  //   .onEnd(() => {
  //     // Smooth transition to final position using spring animation
  //     translateY.value = withSpring(translateY.value);
  //   });

  // // Animated style for the component
  // const animatedStyle = useAnimatedStyle(() => ({
  //   transform: [{ translateY: translateY.value }],
  // }));

  const translationY = useSharedValue(calendarEvent.start);
  const prevTranslationY = useSharedValue(0);
  const duration = useSharedValue(calendarEvent.end - calendarEvent.start);
  const deltaTime = useSharedValue(0);
  const isDragging = useSharedValue(false); // State to track if dragging is active
  const cachedDeltaTime = useSharedValue(0);

  // const updateEventPositionAndHeight = (newTranslationY) => {
  //   "worklet"; // Mark the function as a worklet for synchronous updates on UI thread

  //   // Compute deltaTime directly
  //   const deltaTime = prevTranslationY.value - newTranslationY;

  //   // Update translationY
  //   translationY.value = newTranslationY;

  //   // Compute and set the new duration to ensure the height stays in sync
  //   const newDuration = duration.value + deltaTime;

  //   return {
  //     newTranslationY,
  //     deltaTime,
  //     newDuration,
  //   };
  // };

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: (translationY.value / 60) * hourHeight },
      {
        scale: withTiming(isDragging.value ? 1.01 : 1, {
          duration: 200,
        }),
      },
    ],
    backgroundColor: isDragging.value ? "#f0f0f0" : "#d5e9fd",
    borderColor: isDragging.value ? Colors.light.accent : "#d5e9fd",
    borderStyle: "solid",
    borderWidth: 2,
    height:
      (duration.value / 60) * hourHeight + (deltaTime.value / 60) * hourHeight,
  }));

  const increment = 15;

  // const circlePanUp = Gesture.Pan()
  //   .minDistance(1)
  //   .onStart(() => {
  //     prevTranslationY.value = translationY.value;
  //     cachedDeltaTime.value = 0;
  //   })
  //   .onUpdate((event) => {
  //     const newTranslationY =
  //       prevTranslationY.value + (-event.translationY / hourHeight) * 60;
  //     const roundedTranslationY =
  //       Math.round(newTranslationY / increment) * increment;

  //     const deltaTime = prevTranslationY.value - roundedTranslationY;
  //     if (cachedDeltaTime.value !== deltaTime) {
  //       duration.value = duration.value + deltaTime;
  //     }
  //     // translationY.value = roundedTranslationY;
  //     cachedDeltaTime.value = deltaTime;
  //   })
  //   .onEnd(() => {
  //     // duration.value = duration.value + deltaTime.value;
  //     // deltaTime.value = 0;
  //     cachedDeltaTime.value = 0;
  //   })
  //   .runOnJS(true);

  useEffect(() => {
    translationY.value = calendarEvent.start;
  }, [calendarEvent.start]);

  const longPress = Gesture.LongPress()
    .minDuration(500) // Time in ms to trigger long press
    .onStart(() => {
      isDragging.value = isDragging.value ? false : true; // Toggle dragging state
    });
  // .onEnd(() => {
  //   isDragging.value = false; // Deactivate dragging if the long press ends
  // });

  const pan = Gesture.Pan()
    .minDistance(1)
    .enabled(isDragging.value)
    .onStart(() => {
      duration.value = calendarEvent.end - calendarEvent.start;
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const newTranslationY =
        prevTranslationY.value + (event.translationY / hourHeight) * 60;
      const roundedTranslationY =
        Math.round(newTranslationY / increment) * increment;

      translationY.value = roundedTranslationY;
      // translationY.value = clamp(roundedTranslationY, 0, 1440);
    })
    .onEnd((event) => {
      onDragFinished(translationY.value, translationY.value + duration.value);
      // update the translationY value to the nearest hour
      // const hourHeight = 50;
      // const hour = Math.round(translationY.value / hourHeight);
      // translationY.value = withSpring(hour * hourHeight);
    })
    .runOnJS(true);

  // useEffect(() => {
  //   translationY.value = (event.start / 60) * hourHeight;
  // }, [hourHeight]);

  const circlePan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslationY.value = translationY.value;
    })
    .onUpdate((event) => {
      const newTranslationY =
        prevTranslationY.value + (event.translationY / hourHeight) * 60;
      const roundedTranslationY =
        Math.round(newTranslationY / increment) * increment;

      deltaTime.value = prevTranslationY.value - roundedTranslationY;
      translationY.value = roundedTranslationY;
    })
    .onEnd(() => {
      duration.value = duration.value + deltaTime.value;
      deltaTime.value = 0;
    })
    .runOnJS(true);

  return (
    // <GestureDetector gesture={Gesture.Simultaneous(longPress, pan)}>
    <OutsidePressHandler
      onOutsidePress={() => {
        // if (isDragging.value) {
        //   isDragging.value = false;
        // }
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            left: 0,
            width: "100%",
            // height:
            //   ((calendarEvent.end - calendarEvent.start) / 60) * hourHeight,
            padding: 10,
            backgroundColor: "#d5e9fd",
            borderRadius: 10,
            transformOrigin: "top",
          },
          animatedStyles, // Apply animated styles
        ]}
      >
        {/* <GestureDetector gesture={circlePanUp}>
          <View
            style={{
              position: "absolute",
              bottom: -10,
              right: 50,
              width: 20,
              height: 20,
              backgroundColor: "white",
              borderRadius: 10,
              borderColor: Colors.light.accent,
              borderWidth: 2,
            }}
          ></View>
        </GestureDetector> */}
        <GestureDetector gesture={circlePan}>
          <View
            style={{
              position: "absolute",
              bottom: -10,
              right: 50,
              width: 20,
              height: 20,
              backgroundColor: "white",
              borderRadius: 10,
              borderColor: Colors.light.accent,
              borderWidth: 2,
            }}
          ></View>
        </GestureDetector>
        <Text>{calendarEvent.title}</Text>
      </Animated.View>
    </OutsidePressHandler>
    // </GestureDetector>
  );
};

const DraggableResizableSquare = ({
  calendarEvent,
}: {
  calendarEvent: { start: number; end: number };
}) => {
  const increment = (masterIncrement / 60) * hourHeight;
  const minTime = (masterMinimumTime / 60) * hourHeight;
  // Shared values for position and size
  const y = useSharedValue(calendarEvent.start);
  const prevY = useSharedValue(0);
  const height = useSharedValue(calendarEvent.end - calendarEvent.start);
  const prevHeight = useSharedValue(0);
  const isActive = useSharedValue(false);
  const reachedMaxEnd = useSharedValue(false);

  const [isActiveState, setIsActiveState] = useState(false);

  const [bottomTargetTime, setBottomTargetTime] = useState<number | undefined>(
    undefined
  );
  const [topTargetTime, setTopTargetTime] = useState<number | undefined>(
    undefined
  );

  // const containerGesture = React.useMemo(
  //   () =>
  const containerGesture = Gesture.Pan()
    .enabled(isActiveState)
    .onStart(() => {
      prevY.value = y.value;
      reachedMaxEnd.value = false;
    })
    .onUpdate((event) => {
      // if (!isActive.value) return;

      if (
        (calendarEvent.openingTime.end / 60) * hourHeight <
        Math.max(minTime, prevY.value + event.translationY + height.value)
      ) {
        y.value =
          (calendarEvent.openingTime.end / 60) * hourHeight - height.value;
        reachedMaxEnd.value = true;
      } else {
        y.value = prevY.value + event.translationY;
        reachedMaxEnd.value = false;
      }
    })
    .onEnd(() => {
      const roundedTranslationY = Math.round(y.value / increment) * increment;
      y.value = withTiming(roundedTranslationY);
      reachedMaxEnd.value = false;
    })
    .runOnJS(true);
  //   [isActiveState]
  // );

  // Drag Gesture for the entire square
  // const dragGesture = Gesture.Pan()
  //   // .enabled(isActive.value)
  //   .onStart(() => {
  //     prevY.value = y.value;
  //     reachedMaxEnd.value = false;
  //   })
  //   .onUpdate((event) => {
  //     if (!isActive.value) return;

  //     console.log((calendarEvent.openingTime.end / 60) * hourHeight);
  //     console.log(
  //       Math.max(minTime, prevY.value + event.translationY + height.value)
  //     );

  //     if (
  //       (calendarEvent.openingTime.end / 60) * hourHeight <
  //       Math.max(minTime, prevY.value + event.translationY + height.value)
  //     ) {
  //       y.value =
  //         (calendarEvent.openingTime.end / 60) * hourHeight - height.value;
  //       reachedMaxEnd.value = true;
  //     } else {
  //       y.value = prevY.value + event.translationY;
  //       reachedMaxEnd.value = false;
  //     }
  //   })
  //   .onEnd(() => {
  //     const roundedTranslationY = Math.round(y.value / increment) * increment;
  //     y.value = withTiming(roundedTranslationY);
  //     reachedMaxEnd.value = false;
  //   })
  //   .runOnJS(true);

  const resizeTopGesture = Gesture.Pan()
    .onStart(() => {
      prevHeight.value = height.value;
      prevY.value = y.value;
    })
    .onUpdate((event) => {
      if (!isActive.value) return;
      height.value = Math.max(minTime, prevHeight.value - event.translationY);
      y.value = prevY.value + event.translationY;
      const roundedHeightValue = Math.round(y.value / increment) * increment;
      // setTopTargetTime((roundedHeightValue / hourHeight) * 60);
    })
    .onEnd(() => {
      const roundedYValue = Math.round(y.value / increment) * increment;
      y.value = withTiming(roundedYValue);
      const roundedHeightValue =
        Math.round(height.value / increment) * increment;
      height.value = withTiming(roundedHeightValue);
      // setTopTargetTime(undefined);
    })
    .runOnJS(true);

  const resizeBottomGesture = Gesture.Pan()
    .onStart(() => {
      prevHeight.value = height.value;
      reachedMaxEnd.value = false;
    })
    .onUpdate((event) => {
      if (!isActive.value) return;

      height.value = Math.min(
        (calendarEvent.openingTime.end / 60) * hourHeight - y.value,
        Math.max(minTime, prevHeight.value + event.translationY)
      );

      if (
        (calendarEvent.openingTime.end / 60) * hourHeight - y.value <
        Math.max(minTime, prevHeight.value + event.translationY)
      ) {
        reachedMaxEnd.value = true;
      } else {
        reachedMaxEnd.value = false;
      }

      const roundedHeightValue =
        Math.round(height.value / increment) * increment;
      setBottomTargetTime(((roundedHeightValue + y.value) / hourHeight) * 60);
      // onTargetTimeChange(
      //   ((Math.round((height.value + y.value) / increment) * increment) /
      //     hourHeight) *
      //     60
      // );
    })
    .onEnd(() => {
      const roundedHeightValue =
        Math.round(height.value / increment) * increment;
      height.value = withTiming(roundedHeightValue);
      reachedMaxEnd.value = false;
      setBottomTargetTime(undefined);
      // onTargetTimeChange(undefined);
    })
    .runOnJS(true);

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    borderWidth: withTiming(isActive.value ? 2 : 0, {
      duration: 200,
    }),
  }));

  const animatedSquareStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    height: height.value,
  }));

  const handleTopStyle = useAnimatedStyle(() => ({
    top: -14,
    left: 0,
    right: 0,
    height: 30,
    // opacity: 1,
    opacity: withTiming(isActive.value ? 1 : 0),
  }));

  const handleBottomStyle = useAnimatedStyle(() => ({
    bottom: -14,
    left: 0,
    right: 0,
    height: 30,
    // opacity: 1,
    opacity: withTiming(isActive.value ? 1 : 0),
  }));

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(reachedMaxEnd.value && isActive.value ? 1 : 0, {
      duration: 200,
    }),
  }));

  const zIndexAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: isActive.value ? 10 : 1,
  }));

  const longPress = Gesture.LongPress()
    .minDuration(300)
    .onStart(() => {
      if (isActive.value) {
        isActive.value = false;
        setIsActiveState(false);
      } else {
        isActive.value = true;
        setIsActiveState(true);
      }
    })
    .runOnJS(true);

  return (
    // <GestureDetector gesture={dragGesture}>
    <Animated.View
      style={[
        {
          zIndex: calendarEvent.id === 1 ? 10 : 1,
        },
        zIndexAnimatedStyle,
      ]}
    >
      <GestureDetector
        gesture={Gesture.Simultaneous(containerGesture, longPress)}
      >
        {/* <GestureDetector gesture={isActiveState ? containerGesture : longPress}> */}
        <OutsidePressHandler
          onOutsidePress={() => {
            isActive.value = false;
            setIsActiveState(false);
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor: "transparent",
                position: "absolute",
                width: "100%",
                // overflow: "hidden",
              },
              animatedSquareStyle,
            ]}
          >
            <Animated.View
              style={[
                {
                  flex: 1,
                  borderRadius: 19,
                  borderColor: Colors.light.accent,
                  borderWidth: 2,
                },
                borderAnimatedStyle,
              ]}
            >
              <View
                style={{
                  flex: 1,
                  paddingVertical: 4,
                  paddingHorizontal: 2,
                  transform: [{ translateY: -2 }],
                }}
              >
                <ImageWithFallback
                  key="test"
                  style={{ width: "100%", height: "100%", borderRadius: 15 }}
                  source={{
                    uri: `https://storage.googleapis.com/favel-photos/activites/${calendarEvent.aid}-700.jpg`,
                  }}
                  fallbackSource={require("@/assets/images/no-image.png")}
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,1)"]}
                  style={{
                    position: "absolute",
                    height: "50%",
                    minHeight: 60,
                    bottom: 0,
                    left: 2,
                    right: 2,
                    borderRadius: 15,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 24,
                      fontFamily: "Outfit_600SemiBold",
                      marginBottom: 5,
                    }}
                  >
                    Abbaye de Sénanque
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#7549F2",
                        padding: 5,
                        borderRadius: 5,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Icon
                        icon={`monumentIcon`}
                        size={10}
                        color={"white"}
                      />
                    </View>
                    <Text
                      style={{
                        color: "white",
                        fontSize: 14,
                        fontFamily: "Outfit_400Regular",
                      }}
                    >
                      {calendarEvent.title}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
            <Animated.View
              style={[
                {
                  flex: 1,
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                },
                alertAnimatedStyle,
              ]}
            >
              <MaskedView
                style={{
                  flex: 1,
                }}
                maskElement={
                  <View
                    style={{
                      flex: 1,
                      borderRadius: 19,
                      borderColor: Colors.light.accent,
                      borderWidth: 2,
                    }}
                  />
                }
              >
                <LinearGradient
                  style={{
                    flex: 1,
                  }}
                  colors={["rgba(235, 97, 50,0)", "rgb(235, 97, 50)"]}
                />
              </MaskedView>
              <Text
                style={{
                  position: "absolute",
                  bottom: -25,
                  left: 10,
                  color: "rgb(235, 97, 50)",
                  fontSize: 16,
                  fontFamily: "Outfit_500Medium",
                }}
              >
                This place closes at 14:00
              </Text>
            </Animated.View>
            <GestureDetector gesture={resizeTopGesture}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    height: 30,
                    zIndex: 10,
                    // backgroundColor: "blue",
                  },
                  handleTopStyle,
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 50,
                    width: 20,
                    height: 20,
                    backgroundColor: "white",
                    borderRadius: 10,
                    borderColor: Colors.light.accent,
                    borderWidth: 2,
                  }}
                />
                {/* {topTargetTime && (
              <Text
                style={{
                  position: "absolute",
                  top: 9,
                  right: 0,
                  width: 35,
                  transform: [{ translateX: -40 }],
                  fontSize: 12,
                  textAlign: "right",
                }}
              >
                {topTargetTime % 60 !== 0 ? topTargetTime % 60 : ""}
              </Text>
            )} */}
              </Animated.View>
            </GestureDetector>

            <GestureDetector gesture={resizeBottomGesture}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    height: 30,
                    zIndex: 10,
                  },
                  handleBottomStyle,
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    bottom: 5,
                    right: 50,
                    width: 20,
                    height: 20,
                    backgroundColor: "white",
                    borderRadius: 10,
                    borderColor: Colors.light.accent,
                    borderWidth: 2,
                  }}
                />
                {bottomTargetTime && (
                  <Text
                    style={{
                      position: "absolute",
                      bottom: 9,
                      left: 0,
                      width: 35,
                      transform: [{ translateX: -40 }],
                      fontSize: 12,
                      textAlign: "right",
                    }}
                  >
                    {bottomTargetTime % 60 !== 0 ? bottomTargetTime % 60 : ""}
                  </Text>
                )}
              </Animated.View>
            </GestureDetector>
          </Animated.View>
        </OutsidePressHandler>
      </GestureDetector>
    </Animated.View>
  );
};

const WeekCalendar = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Abbaye cistercienne",
      start: 540,
      end: 660,
      day: "Mon",
      aid: "123cdc46-e1dd-4095-86fb-f8ea5c32d31f",
      openingTime: {
        start: 540,
        end: 1200,
      },
    },
    {
      id: 2,
      title: "Lunch",
      start: 600,
      end: 750,
      day: "Tue",
      aid: "676904cc-87ac-4ab9-9506-dd5052b25b4f",
      openingTime: {
        start: 500,
        end: 840,
      },
    },
  ]);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: padding,
      }}
    >
      <ScrollView
        scrollEnabled={true}
        style={{
          height: hourHeight,
          // justifyContent: "flex-start",
          // alignItems: "flex-start",
          borderBottomWidth: 1,
          borderColor: "#ccc",
          // transform: [{ translateY: -10 }],
        }}
      >
        <View
        // style={{
        //   flexDirection: "row",
        // }}
        >
          <View
            style={{
              width: "100%",
            }}
          >
            {hours.map((hour) => (
              <View
                key={hour}
                style={{
                  height: hourHeight,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  // borderBottomWidth: 1,
                  // borderColor: "#ccc",
                  flexDirection: "row",
                }}
              >
                <Text
                  style={{
                    transform: [{ translateY: -10 }],
                    fontSize: 12,
                    textAlign: "right",
                    width: 35,
                  }}
                >
                  {hour}:00
                </Text>
                <View
                  style={{
                    height: 1,
                    flex: 1,
                    marginLeft: 10,
                    backgroundColor: "#ccc",
                  }}
                />
              </View>
            ))}
          </View>
          <View
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 40,
              right: 0,
              height: "100%",
            }}
          >
            {events.map((event) => (
              // <Event
              //   key={event.id}
              //   calendarEvent={event}
              //   onDragFinished={(start, end) =>
              //     handleDrag(event.id, start, end)
              //   }
              // />
              <DraggableResizableSquare
                calendarEvent={{
                  ...event,
                  start: (event.start / 60) * hourHeight,
                  end: (event.end / 60) * hourHeight,
                }}
                key={event.id}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default WeekCalendar;
// import { Text } from "@/components/Themed";
// import { padding } from "@/constants/values";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   FlatList,
//   Dimensions,
//   Alert,
// } from "react-native";
// import {
//   Gesture,
//   GestureDetector,
//   HandlerStateChangeEvent,
//   PanGestureHandler,
//   PanGestureHandlerEventPayload,
//   State,
// } from "react-native-gesture-handler";
// import Animated, {
//   clamp,
//   useAnimatedGestureHandler,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
//   withTiming,
// } from "react-native-reanimated";
// import OutsidePressHandler from "react-native-outside-press";
// import Colors from "@/constants/Colors";

// const { width, height } = Dimensions.get("screen");

// const hours = Array.from({ length: 24 }, (_, i) => i);
// const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// const hourHeight = 100;

// const Event = ({ calendarEvent, onDragFinished }) => {
//   // Shared value to hold the Y position
//   // const translateY = useSharedValue(event.start * 50);

//   // // Use Animated Gesture Handler to manage the drag state
//   // const panGesture = Gesture.Pan()
//   //   .onStart(() => {
//   //     // Handler for the gesture start event
//   //   })
//   //   .onUpdate((event) => {
//   //     // Update the translation based on the gesture
//   //     translateY.value = event.translationY;
//   //   })
//   //   .onEnd(() => {
//   //     // Smooth transition to final position using spring animation
//   //     translateY.value = withSpring(translateY.value);
//   //   });

//   // // Animated style for the component
//   // const animatedStyle = useAnimatedStyle(() => ({
//   //   transform: [{ translateY: translateY.value }],
//   // }));

//   const top = useSharedValue(calendarEvent.start);
//   const bottom = useSharedValue(calendarEvent.end);
//   const prevtop = useSharedValue(0);
//   const duration = useSharedValue(calendarEvent.end - calendarEvent.start);
//   const deltaTime = useSharedValue(0);
//   const isDragging = useSharedValue(false); // State to track if dragging is active

//   const animatedStyles = useAnimatedStyle(() => ({
//     transform: [
//       {
//         scale: withTiming(isDragging.value ? 1.01 : 1, {
//           duration: 200,
//         }),
//       },
//     ],
//     // top: (top.value / 60) * hourHeight,
//     // bottom: (bottom.value / 60) * hourHeight,
//     backgroundColor: isDragging.value ? "#f0f0f0" : "#d5e9fd",
//     borderColor: isDragging.value ? Colors.light.accent : "#d5e9fd",
//     borderStyle: "solid",
//     borderWidth: 2,
//     // height: (duration.value / 60) * hourHeight + deltaTime.value,
//   }));

//   const increment = 15;

//   useEffect(() => {
//     top.value = calendarEvent.start;
//   }, [calendarEvent.start]);

//   const longPress = Gesture.LongPress()
//     .minDuration(500) // Time in ms to trigger long press
//     .onStart(() => {
//       isDragging.value = isDragging.value ? false : true; // Toggle dragging state
//     });
//   // .onEnd(() => {
//   //   isDragging.value = false; // Deactivate dragging if the long press ends
//   // });

//   const pan = Gesture.Pan()
//     .minDistance(1)
//     .enabled(isDragging.value)
//     .onStart(() => {
//       duration.value = calendarEvent.end - calendarEvent.start;
//       prevtop.value = top.value;
//     })
//     .onUpdate((event) => {
//       const newtop = prevtop.value + (event.translationY / hourHeight) * 60;
//       const roundedtop = Math.round(newtop / increment) * increment;

//       top.value = roundedtop;
//       // top.value = clamp(roundedtop, 0, 1440);
//     })
//     .onEnd((event) => {
//       onDragFinished(top.value, top.value + duration.value);
//       // update the top value to the nearest hour
//       // const hourHeight = 50;
//       // const hour = Math.round(top.value / hourHeight);
//       // top.value = withSpring(hour * hourHeight);
//     })
//     .runOnJS(true);

//   // useEffect(() => {
//   //   top.value = (event.start / 60) * hourHeight;
//   // }, [hourHeight]);

//   const circlePan = Gesture.Pan()
//     .minDistance(1)
//     .onStart(() => {
//       prevtop.value = top.value;
//     })
//     .onUpdate((event) => {
//       const newtop = prevtop.value + (event.translationY / hourHeight) * 60;
//       const roundedtop = Math.round(newtop / increment) * increment;

//       deltaTime.value = calendarEvent.start - roundedtop;

//       top.value = roundedtop;
//       // duration.value = duration.value + deltaTime;

//       // Update only the start time; end time remains fixed
//       // top.value = Math.min(
//       //   roundedtop,
//       //   calendarEvent.end - 30
//       // ); // Ensure it does not overlap the end time
//       // duration.current = calendarEvent.end - top.value; // Update the duration based on new start
//     })
//     .onEnd(() => {
//       deltaTime.value = 0;
//       // onDragFinished(top.value, top.value + duration.value);
//     })
//     .runOnJS(true);

//   return (
//     <GestureDetector gesture={Gesture.Simultaneous(longPress, pan)}>
//       <OutsidePressHandler
//         onOutsidePress={() => {
//           // if (isDragging.value) {
//           //   isDragging.value = false;
//           // }
//         }}
//       >
//         <Animated.View
//           style={[
//             {
//               position: "absolute",
//               left: 0,
//               width: "100%",
//               top: 200,
//               bottom: 0,
//               // height:
//               //   ((calendarEvent.end - calendarEvent.start) / 60) * hourHeight,
//               padding: 10,
//               backgroundColor: "#d5e9fd",
//               borderRadius: 10,
//             },
//             // animatedStyles, // Apply animated styles
//           ]}
//         >
//           {/* <GestureDetector gesture={circlePan}> */}
//           <View
//             style={{
//               position: "absolute",
//               top: -10,
//               right: 50,
//               width: 20,
//               height: 20,
//               backgroundColor: "white",
//               borderRadius: 10,
//               borderColor: Colors.light.accent,
//               borderWidth: 2,
//             }}
//           ></View>
//           {/* </GestureDetector> */}
//           <Text>{calendarEvent.title}</Text>
//         </Animated.View>
//       </OutsidePressHandler>
//     </GestureDetector>
//   );
// };

// const WeekCalendar = () => {
//   const [events, setEvents] = useState([
//     { id: 1, title: "Meeting", start: 600, end: 645, day: "Mon" },
//     { id: 2, title: "Lunch", start: 700, end: 850, day: "Tue" },
//   ]);

//   const handleDrag = (id, start, end) => {
//     setEvents((prev) =>
//       prev.map((event) =>
//         event.id === id ? { ...event, start: start, end: end } : event
//       )
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         {days.map((day, index) => (
//           <View
//             key={index}
//             style={styles.dayHeader}
//           >
//             <Text>{day}</Text>
//           </View>
//         ))}
//       </View>
//       <ScrollView style={styles.hours}>
//         <View
//         // style={{
//         //   flexDirection: "row",
//         // }}
//         >
//           <View
//             style={{
//               width: "100%",
//             }}
//           >
//             {hours.map((hour) => (
//               <View
//                 key={hour}
//                 style={{
//                   height: hourHeight,
//                   justifyContent: "flex-start",
//                   alignItems: "flex-start",
//                   // borderBottomWidth: 1,
//                   // borderColor: "#ccc",
//                   flexDirection: "row",
//                 }}
//               >
//                 <Text
//                   style={{
//                     transform: [{ translateY: -10 }],
//                     fontSize: 12,
//                   }}
//                 >
//                   {hour}:00
//                 </Text>
//                 <View
//                   style={{
//                     height: 1,
//                     flex: 1,
//                     marginLeft: 10,
//                     backgroundColor: "#ccc",
//                   }}
//                 />
//               </View>
//             ))}
//           </View>
//           <View
//             style={{
//               flex: 1,
//               position: "absolute",
//               top: 0,
//               left: 40,
//               right: 0,
//               height: "100%",
//             }}
//           >
//             {events.map((event) => (
//               <Event
//                 key={event.id}
//                 calendarEvent={event}
//                 onDragFinished={(start, end) =>
//                   handleDrag(event.id, start, end)
//                 }
//               />
//             ))}
//           </View>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     height: "100%",
//     padding: padding,
//     paddingRight: 0,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: "row",
//   },
//   dayHeader: {
//     flex: 1,
//     padding: 10,
//     borderRightWidth: 1,
//     borderColor: "#ccc",
//   },
//   hours: {
//     paddingRight: padding,
//   },
//   hour: {
//     height: hourHeight,
//     justifyContent: "flex-start",
//     alignItems: "flex-start",
//     borderBottomWidth: 1,
//     borderColor: "#ccc",
//     // transform: [{ translateY: -10 }],
//   },
// });

// export default WeekCalendar;
