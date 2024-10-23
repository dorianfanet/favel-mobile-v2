import DotColumn from "@/components/DotColumn";
import Icon from "@/components/Icon";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import useTheme from "@/hooks/useTheme";
import { Event } from "@/types/calendar";
import { TripEvent, TripEventActivity } from "@/types/trip";
import { LinearGradient } from "expo-linear-gradient";
import { transform } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
import { View, TouchableOpacity, Dimensions, Pressable } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  measure,
  runOnJS,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import OutsidePressHandler from "react-native-outside-press";
import { useBottomSheetRefs } from "@/context/bottomSheetsRefContext";
import { easeGradient } from "react-native-easing-gradient";
import { supabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@clerk/clerk-expo";
import { useTripNavigationActions } from "@/hooks/useTripNavigationActions";

const { colors, locations } = easeGradient({
  colorStops: {
    0: {
      color: "transparent",
    },
    1: {
      color: "#000000be",
    },
  },
});

interface EventItemProps {
  event: TripEvent;
  hourHeight: number;
  dayDate: Date;
  offsetY: SharedValue<number>;
  calendarHeight: number;
}

const { width } = Dimensions.get("window");

const masterIncrement = 15;
const masterMinimumTime = 30;

const EventItem: React.FC<EventItemProps> = ({
  event,
  hourHeight,
  dayDate,
  offsetY,
  calendarHeight,
}) => {
  const inset = useSafeAreaInsets();

  const { startHour, endHour, duration } = React.useMemo(() => {
    const startHour =
      event.start.getDate() !== dayDate.getDate()
        ? 0
        : event.start.getHours() + event.start.getMinutes() / 60;
    const endHour =
      event.end.getDate() !== dayDate.getDate()
        ? 24
        : event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;
    return { startHour, endHour, duration };
  }, [event.start, event.end, dayDate]);

  const { theme } = useTheme();

  // gesture handling
  const increment = (masterIncrement / 60) * hourHeight;
  const minTime = (masterMinimumTime / 60) * hourHeight;
  const y = useSharedValue(startHour * hourHeight);
  const prevY = useSharedValue(0);
  const height = useSharedValue(duration * hourHeight);
  const prevHeight = useSharedValue(0);
  const isActive = useSharedValue(false);
  const [isActiveState, setIsActiveState] = React.useState(false);
  const animRef = useAnimatedRef();

  const animatedStyle = useAnimatedStyle(() => {
    const offset = offsetY.value + calendarHeight - inset.bottom;
    const startHeight = y.value;
    const endHeight = y.value + height.value;

    const topPadding = inset.bottom + 48;

    return {
      transform: [
        {
          translateY:
            offset < endHeight
              ? offset > startHeight + topPadding
                ? -(endHeight - offset)
                : -(duration * hourHeight - topPadding)
              : 0,
        },
      ],
    };
  });

  const containerGesture = Gesture.Simultaneous(
    Gesture.LongPress()
      .minDuration(300)
      .onStart(() => {
        // if (isActive.value) {
        //   isActive.value = false;
        //   setIsActiveState(false);
        // } else {
        //   isActive.value = true;
        //   setIsActiveState(true);
        // }
        runOnJS(setIsActiveState)(true);
        isActive.value = true;
      }),
    // .simultaneousWithExternalGesture(Gesture.Pan()),

    Gesture.Pan()
      // .manualActivation(true)
      .onTouchesMove((_, manager) => {
        if (isActiveState) {
          manager.activate();
        } else {
          manager.fail();
        }
      })
      .onStart(() => {
        prevY.value = y.value;
      })
      .onUpdate((event) => {
        y.value = prevY.value + event.translationY;
      })
      .onEnd(() => {
        const roundedTranslationY = Math.round(y.value / increment) * increment;
        y.value = withTiming(roundedTranslationY);
        // reachedMaxEnd.value = false;
      })
  );

  const resizeTopGesture = Gesture.Pan()
    .onTouchesMove((_, manager) => {
      if (isActiveState) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onStart(() => {
      prevHeight.value = height.value;
      prevY.value = y.value;
    })
    .onUpdate((event) => {
      height.value = Math.max(minTime, prevHeight.value - event.translationY);
      y.value = prevY.value + event.translationY;
    })
    .onEnd(() => {
      const roundedYValue = Math.round(y.value / increment) * increment;
      y.value = withTiming(roundedYValue);
      const roundedHeightValue =
        Math.round(height.value / increment) * increment;
      height.value = withTiming(roundedHeightValue);
    });

  const resizeBottomGesture = Gesture.Pan()
    .onTouchesMove((_, manager) => {
      if (isActiveState) {
        manager.activate();
      } else {
        manager.fail();
      }
    })
    .onStart(() => {
      prevHeight.value = height.value;
    })
    .onUpdate((event) => {
      height.value = Math.min(
        Math.max(minTime, prevHeight.value + event.translationY)
      );
    })
    .onEnd(() => {
      const roundedHeightValue =
        Math.round(height.value / increment) * increment;
      height.value = withTiming(roundedHeightValue);
    });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    height: height.value,
    shadowOpacity: withTiming(isActive.value ? 0.5 : 0),
  }));

  const handleTopStyle = useAnimatedStyle(() => ({
    top: -14,
    left: 0,
    right: 0,
    height: 30,
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

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isActive.value ? 1 : 0),
  }));

  const zIndexAnimatedStyle = useAnimatedStyle(() => ({
    zIndex: isActive.value ? 10 : 1,
  }));

  const { push } = useTripNavigationActions();

  const isBig = useMemo(() => {
    return duration * hourHeight > calendarHeight;
  }, [duration, hourHeight]);

  return event.type === "transport" ? (
    <TransportEvent
      event={event}
      startHour={startHour}
      duration={duration}
      hourHeight={hourHeight}
      theme={theme}
    />
  ) : (
    <Animated.View
      style={[
        {
          zIndex: 1,
        },
        zIndexAnimatedStyle,
      ]}
    >
      <Pressable
        onPress={() => {
          push({
            bottomSheet: "place",
          });
        }}
      >
        <GestureDetector gesture={containerGesture}>
          <OutsidePressHandler
            onOutsidePress={() => {
              isActive.value = false;
              setIsActiveState(false);
            }}
          >
            <Animated.View
              ref={animRef}
              style={[
                {
                  position: "absolute",
                  // top: startHour * hourHeight,
                  left: 0,
                  right: padding,
                  // height: duration * hourHeight,
                  backgroundColor: "black",
                  borderRadius: 20,
                  borderWidth: 0,
                  shadowColor: Colors[theme].accent,
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowRadius: 20,
                  elevation: 20,
                },
                containerAnimatedStyle,
              ]}
            >
              <Animated.View
                style={
                  isBig
                    ? [
                        {
                          position: "absolute",
                          height: calendarHeight,
                          left: 0,
                          right: 0,
                          bottom: 0,
                        },
                        animatedStyle,
                      ]
                    : {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }
                }
              >
                <Thumbnail place={event.place} />
              </Animated.View>
              <View
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: 19,
                  overflow: "hidden",
                }}
              >
                <Animated.View
                  style={[
                    {
                      opacity: 1,
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 200,
                      // overflow: "hidden",
                      // borderBottomLeftRadius: 19,
                      // borderBottomRightRadius: 19,
                    },
                    animatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={colors}
                    locations={locations}
                    style={{
                      flex: 1,
                      pointerEvents: "none",
                      transform: [
                        {
                          translateY: inset.bottom,
                        },
                      ],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: padding,
                      left: padding,
                    }}
                  >
                    <Text
                      fontStyle="subtitle"
                      style={{
                        color: Colors.dark.text.primary,
                      }}
                    >
                      {event.place.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 10,
                        alignItems: "center",
                        marginTop: 5,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#52e472",
                          borderRadius: 10,
                          width: 25,
                          height: 25,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Icon
                          icon="natureIcon"
                          size={12}
                          color={"white"}
                        />
                      </View>
                      <Text
                        style={{
                          color: Colors.dark.text.primary,
                        }}
                      >
                        Park
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </View>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: 19,
                    borderWidth: 4,
                    borderColor: Colors[theme].accent,
                  },
                  borderAnimatedStyle,
                ]}
              />
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
                      right: 50,
                      width: 30,
                      height: 30,
                      backgroundColor: Colors[theme].accent,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      icon="chevronSelectorIcon"
                      size={20}
                      strokeWidth={2}
                      color={Colors.light.text.primary}
                    />
                  </View>
                </Animated.View>
              </GestureDetector>
              <GestureDetector gesture={resizeBottomGesture}>
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      height: 30,
                      zIndex: 10,
                      // backgroundColor: "blue",
                    },
                    handleBottomStyle,
                  ]}
                >
                  <View
                    style={{
                      position: "absolute",
                      right: 50,
                      width: 30,
                      height: 30,
                      backgroundColor: Colors[theme].accent,
                      borderRadius: 15,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      icon="chevronSelectorIcon"
                      size={20}
                      strokeWidth={2}
                      color={Colors.light.text.primary}
                    />
                  </View>
                </Animated.View>
              </GestureDetector>
            </Animated.View>
          </OutsidePressHandler>
        </GestureDetector>
      </Pressable>
    </Animated.View>
  );
};

export default EventItem;

function Thumbnail({ place }: { place: any }) {
  const [imageLink, setImageLink] = React.useState<string | null>(null);

  const { getToken } = useAuth();

  useEffect(() => {
    if (place.photos) {
      supabaseClient(getToken).then(async (supabase) => {
        const { data } = supabase.storage
          .from("place_photos")
          .getPublicUrl(place.photos[0].file_key);

        setImageLink(data.publicUrl);
      });
    }
  }, [place]);

  return (
    <ImageWithFallback
      source={{
        uri: imageLink
          ? imageLink
          : "https://www.tuningblog.eu/wp-content/uploads/2023/03/PACIFIC-COAST-HIGHWAY-KALIFORNIEN-Roadtrip.jpg",
      }}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 19,
      }}
      key={imageLink}
    />
  );
}

function TransportEvent({
  event,
  startHour,
  duration,
  hourHeight,
  theme,
}: {
  event: TripEvent;
  startHour: number;
  duration: number;
  hourHeight: number;
  theme: "light" | "dark";
}) {
  return (
    <View
      style={{
        position: "absolute",
        top: startHour * hourHeight,
        left: 0,
        right: padding,
        height: duration * hourHeight,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        style={{
          justifyContent: "space-around",
          alignItems: "center",
          width: 50,
          height: "100%",
        }}
      >
        {/* <View
          style={{
            width: 15,
            height: 15,
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
            backgroundColor: Colors[theme].text.primary,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            flex: 1,
            width: 4,
            backgroundColor: Colors[theme].text.primary,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            width: 15,
            height: 15,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            backgroundColor: Colors[theme].text.primary,
            opacity: 0.5,
          }}
        /> */}
        {/* <View
          style={{
            gap: 5,
          }}
        >
          {Array.from({ length: 2 }).map((_, index) => (
            <View
              key={index}
              style={{
                width: 5,
                height: 5,
                borderRadius: 5,
                backgroundColor: Colors[theme].accent,
                opacity: 0.5,
              }}
            />
          ))}
        </View> */}
        <View
          style={{
            flex: 1,
          }}
        >
          <DotColumn />
        </View>
        <Icon
          icon="chevronRightDoubleIcon"
          size={24}
          strokeWidth={3}
          color={Colors[theme].accent}
          style={{
            transform: [{ rotate: "90deg" }],
          }}
        />

        <View
          style={{
            flex: 1,
          }}
        >
          <DotColumn />
        </View>
      </View>
      {event.id === "313055ba-0731-4521-8662-e644418586c8" ? (
        <View
          style={{
            position: "absolute",
            top: -15,
            left: 20,
            right: 0,
            bottom: -15,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: Colors[theme].accent,
              }}
            />
            <Text
              style={{
                opacity: 0.8,
              }}
            >
              Golden Gate Park
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: Colors[theme].accent,
              }}
            />
            <Text
              style={{
                opacity: 0.8,
              }}
            >
              The Metro Hotel
            </Text>
          </View>
        </View>
      ) : null}
      <View
        style={{
          gap: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 5,
          }}
        >
          <Text fontStyle="subtitle">23 min</Text>
          <Text fontStyle="body">(2.1 km)</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            gap: 0,
          }}
        >
          <Icon
            icon="pedestrianIcon"
            size={16}
            strokeWidth={2}
            color={Colors[theme].text.primary}
            style={{
              opacity: 0.8,
            }}
          />
          <Icon
            icon="chevronLeftIcon"
            size={16}
            strokeWidth={2}
            color={Colors[theme].text.primary}
            style={{
              opacity: 0.6,
              transform: [{ rotate: "180deg" }],
            }}
          />
          <Icon
            icon="tramIcon"
            size={16}
            strokeWidth={2}
            color={Colors[theme].text.primary}
            style={{
              opacity: 0.8,
            }}
          />
          <Icon
            icon="chevronLeftIcon"
            size={16}
            strokeWidth={2}
            color={Colors[theme].text.primary}
            style={{
              opacity: 0.6,
              transform: [{ rotate: "180deg" }],
            }}
          />
          <Icon
            icon="pedestrianIcon"
            size={16}
            strokeWidth={2}
            color={Colors[theme].text.primary}
            style={{
              opacity: 0.8,
            }}
          />
        </View>
      </View>
    </View>
  );
}
