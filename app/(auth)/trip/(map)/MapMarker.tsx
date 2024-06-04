import { View, Text, Pressable, Platform } from "react-native";
import React from "react";
import { Activity, Category } from "@/types/types";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { categories, colors as categoryColor } from "@/constants/categories";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function MapMarker({
  activity,
  state,
  onPress,
}: {
  activity: Activity;
  state: "inactive" | "active" | "transparent" | "half";
  onPress?: () => void;
}) {
  const markerSize = useSharedValue(40);
  const textOpacity = useSharedValue(0);
  const markerOpacity = useSharedValue(1);

  // Animated styles for marker and text
  const markerStyle = useAnimatedStyle(() => {
    const scale = markerSize.value / 40;
    return {
      transform: [
        { scale },
        { translateY: (1 - scale) * 20 }, // Adjust the anchor point to the bottom center
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
    };
  });

  const markerOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: markerOpacity.value,
    };
  });

  React.useEffect(() => {
    if (state === "active") {
      markerSize.value = withSpring(60, {
        duration: 1000,
        dampingRatio: 0.5,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
        reduceMotion: ReduceMotion.System,
      });
      textOpacity.value = withTiming(1, { duration: 200 });
      markerOpacity.value = withTiming(1, { duration: 200 });
    } else if (state === "inactive") {
      markerSize.value = withSpring(40, {
        duration: 1000,
        dampingRatio: 0.5,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 2,
        reduceMotion: ReduceMotion.System,
      });
      textOpacity.value = withTiming(0, { duration: 200 });
      markerOpacity.value = withTiming(1, { duration: 200 });
    } else if (state === "transparent") {
      markerOpacity.value = withTiming(0, { duration: 200 });
    } else if (state === "half") {
      markerOpacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [state]);

  return (
    <Pressable
      style={{
        width: Platform.OS === "android" ? 150 : 40,
        height: Platform.OS === "android" ? 120 : 60,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={() => {
        onPress && onPress();
      }}
    >
      <Animated.View
        style={[
          {
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
            width: 40,
            height: 60,
            overflow: "visible",
          },
          markerOpacityStyle,
        ]}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            overflow: "visible",
          }}
        >
          <Animated.View
            style={[
              {
                width: 40,
                height: 40,
                // overflow: "visible",
              },
              markerStyle,
            ]}
          >
            <Icon
              icon="activitiesMapPin"
              size={40}
              color={
                categoryColor[activity.category as Category] ||
                categoryColor.unknown
              }
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                padding: 11,
                paddingTop: 8,
              }}
            >
              <Icon
                icon={`${
                  categories.includes(activity.category as Category)
                    ? (activity.category as Category)
                    : "unknown"
                }Icon`}
                size={18}
                color={"white"}
              />
            </View>
            {/* <Pressable
              onPress={() => {
                console.log("Pressable");
                onPress && onPress();
              }}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "red",
              }}
            /> */}
          </Animated.View>
        </View>
        <View
          style={{
            position: "absolute",
            top: 45,
            width: 150,
          }}
        >
          <Animated.View
            style={[
              {
                backgroundColor:
                  categoryColor[activity.category as Category] ||
                  categoryColor.unknown,
                // backgroundColor: "#426682",
                borderRadius: 4,
                padding: 2,
                paddingHorizontal: 4,
                alignSelf: "center",
              },
              textStyle,
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 12,
                color: "white",
                fontFamily: "Outfit_500Medium",
                textAlign: "center",
              }}
            >
              {activity.name}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}
