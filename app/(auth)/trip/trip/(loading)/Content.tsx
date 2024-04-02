import { View, Text, Dimensions } from "react-native";
import React, { forwardRef, useEffect } from "react";
import { BlurView } from "@/components/Themed";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurViewProps } from "expo-blur";
import { useTrip } from "@/context/tripContext";
import { Activity, Day } from "@/types/types";
import ActivityCard from "../../components/ActivityCard";

function findScale(position: number) {
  switch (position) {
    case 0:
      return 1;
    case 1:
      return 0.92;
    case 2:
      return 0.84;
    case 3:
      return 0.76;
    default:
      return 1;
  }
}

function findOpacity(position: number) {
  switch (position) {
    case 0:
      return 1;
    case 1:
      return 0.8;
    case 2:
      return 0.6;
    case 3:
      return 0;
    default:
      return 1;
  }
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function Card({
  position,
  isNew,
  activity,
}: {
  position: number;
  isNew: boolean;
  activity: Activity;
}) {
  const screenWidth = Dimensions.get("window").width;

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const containerOpacity = useSharedValue(1);
  const top = useSharedValue(0);
  const translateX = useSharedValue(isNew ? screenWidth : 0);

  useEffect(() => {
    scale.value = withTiming(findScale(position));
    opacity.value = withTiming(findOpacity(position));
    top.value = withTiming(position * 20);
    if (isNew) {
      translateX.value = withDelay(200, withTiming(0));
    }
    containerOpacity.value = withTiming(position > 2 ? 0 : 1);
  }, [position]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
      top: top.value,
      // opacity: opacity.value,
      opacity: containerOpacity.value,
    };
  });

  const animatedBlurStyle = useAnimatedStyle(() => {
    return {};
  });

  const animatedActivityCardStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: `rgba(13, 67, 107, ${opacity.value * 0.72})`,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: "100%",
        },
        animatedStyle,
      ]}
    >
      <AnimatedBlurView
        intensity={40 - position * 10}
        style={[
          {
            flex: 1,
            padding: 0,
            margin: 0,
            justifyContent: "center",
            overflow: "hidden",
            opacity: 1,
            // backgroundColor: "rgba(13, 67, 107, 0.72)",
            backgroundColor: "transparent",
            borderRadius: 15,
            marginTop: 15,
          },
          animatedBlurStyle,
        ]}
        tint={"default"}
      >
        {/* <BlurView
        style={{
          borderRadius: 15,
          marginTop: 15,
        }}
      > */}
        <Animated.View style={[animatedActivityCardStyle]}>
          <ActivityCard
            activity={activity}
            style={{
              paddingHorizontal: 7,
              paddingVertical: 7,
              marginVertical: 0,
              height: 100,
            }}
            loading
            noCache
          />
        </Animated.View>
      </AnimatedBlurView>
    </Animated.View>
  );
}

export default function Content({ day }: { day: Day }) {
  const [visibleCards, setVisibleCards] = React.useState<Activity[] | null>(
    null
  );

  // const { trip } = useTrip();

  useEffect(() => {
    if (!day) return;

    if (day.activities) {
      setVisibleCards(day.activities!.slice(-4));
    }
  }, [day]);

  return (
    // <BlurView
    //   intensity={40}
    //   style={{
    //     flex: 1,
    //     padding: 0,
    //     margin: 0,
    //     justifyContent: "center",
    //     overflow: "hidden",
    //     borderRadius: 20,
    //     opacity: 1,
    //     backgroundColor: "#0d4376b8",
    //   }}
    // >

    <View
      style={{
        height: 140,
      }}
    >
      {visibleCards?.map((activity, index) => (
        <Card
          isNew={index === visibleCards.length - 1}
          position={
            (visibleCards.length < 4 ? visibleCards.length - 1 : 3) - index
          }
          key={activity.id}
          activity={activity}
        />
      ))}
      {/* <Card position={2}>
        <ActivityCard
          activity={{
            id: "7841135a-02a2-4d95-9cb6-a9ecbff96d73",
            name: "Sagrada Familia",
            coordinates: {
              latitude: 0,
              longitude: 0,
            },
            formattedType: "activity",
            category: "monument",
            display_category: "Monument",
            avg_duration: 1,
          }}
          style={{
            paddingHorizontal: 7,
            paddingVertical: 7,
            marginVertical: 0,
            height: 100,
          }}
        />
      </Card>
      <Card position={1}>
        <ActivityCard
          activity={{
            id: "7841135a-02a2-4d95-9cb6-a9ecbff96d73",
            name: "Sagrada Familia",
            coordinates: {
              latitude: 0,
              longitude: 0,
            },
            formattedType: "activity",
            category: "monument",
            display_category: "Monument",
            avg_duration: 1,
          }}
          style={{
            paddingHorizontal: 7,
            paddingVertical: 7,
            marginVertical: 0,
            height: 100,
          }}
        />
      </Card>
      <Card position={0}>
        <ActivityCard
          activity={{
            id: "7841135a-02a2-4d95-9cb6-a9ecbff96d73",
            name: "Sagrada Familia",
            coordinates: {
              latitude: 0,
              longitude: 0,
            },
            formattedType: "activity",
            category: "monument",
            display_category: "Monument",
            avg_duration: 1,
          }}
          style={{
            paddingHorizontal: 7,
            paddingVertical: 7,
            marginVertical: 0,
            height: 100,
          }}
        />
      </Card> */}
    </View>
  );
}
