import { View, Animated, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Activity, CachedActivity, Category } from "@/types/types";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import { MMKV } from "../_layout";
import Colors from "@/constants/Colors";
import ImageWithFallback from "@/components/ImageWithFallback";
import { categories, colors as categoryColor } from "@/constants/categories";
import { formatHoursToHoursAndMinutes } from "@/lib/utils";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { useTrip } from "@/context/tripContext";
import { newTripEdit } from "@/lib/tripEdits";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function PlaceCard({
  swipeable,
  activity,
  drag,
  isActive,
  style,
  theme = "dark",
  draggable,
  noCache,
  onDelete,
}: {
  swipeable?: boolean;
  activity: Activity;
  drag?: any;
  isActive?: boolean;
  style?: any;
  theme?: "light" | "dark";
  draggable?: boolean;
  noCache?: boolean;
  onDelete?: () => void;
}) {
  const { trip } = useTrip();
  const { rest } = useLocalSearchParams();
  const id = rest[0];
  const { user } = useUser();

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    console.log(dragX);
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 80],
      extrapolate: "clamp",
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: "#fc4949",
            justifyContent: "center",
            alignItems: "flex-end",
          },
          {
            opacity,
          },
        ]}
      >
        <Animated.Text
          style={[
            {
              color: "white",
              fontSize: 16,
              backgroundColor: "transparent",
              padding: 10,
            },
            {
              transform: [{ translateX: trans }],
            },
          ]}
        >
          Supprimer
        </Animated.Text>
      </Animated.View>
    );
  };

  const opacity = useSharedValue(1);
  const height = useSharedValue(110);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      height: height.value,
    };
  });

  function handleDelete() {
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(() => {
      height.value = withTiming(0, { duration: 200 });
    }, 200);
    setTimeout(() => {
      onDelete && onDelete();
    }, 400);
    if (trip && activity.index) {
      newTripEdit({
        type: "delete",
        day_index: activity.index,
        location: trip[activity.index].location,
        activity_id: activity.id!,
        author_id: user?.id!,
        trip_id: id,
      });
    }
  }

  return (
    <>
      {swipeable ? (
        <Reanimated.View style={[containerStyle]}>
          <Swipeable
            friction={2}
            enableTrackpadTwoFingerGesture
            rightThreshold={120}
            renderRightActions={renderRightActions}
            onSwipeableOpen={(direction) => {
              if (direction === "right") {
                handleDelete();
              }
            }}
          >
            <ActivityCardContent
              activity={activity}
              drag={drag}
              isActive={isActive}
              style={style}
              theme={theme}
              draggable={draggable}
            />
          </Swipeable>
        </Reanimated.View>
      ) : (
        <ActivityCardContent
          activity={activity}
          drag={drag}
          isActive={isActive}
          style={style}
          theme={theme}
          draggable={draggable}
          noCache={noCache}
        />
      )}
    </>
  );
}

function ActivityCardContent({
  activity,
  drag,
  isActive,
  style,
  theme = "dark",
  draggable,
  noCache,
}: {
  activity: Activity;
  drag?: any;
  isActive?: boolean;
  style?: any;
  theme?: "light" | "dark";
  draggable?: boolean;
  noCache?: boolean;
}) {
  const [activityData, setActivityData] = useState<Activity>(activity);

  useEffect(() => {
    async function fetchActivityFromDb() {
      const { data, error } = await supabase
        .from("activities")
        .select("avg_duration, category, name, display_category, coordinates")
        .eq("id", activity.id)
        .single();

      if (error) {
        console.log(error);
      }

      if (data) {
        setActivityData((prev) => ({ ...prev, ...data }));
        MMKV.setStringAsync(
          `activity-${activity.id}`,
          JSON.stringify({
            data: data,
            expiresAt: new Date().getTime() + 86400000,
          })
        );
      }
    }

    async function fetchActivity() {
      const cachedActivity = await MMKV.getStringAsync(
        `activity-${activity.id}`
      );

      if (cachedActivity) {
        const { data, expiresAt } = JSON.parse(
          cachedActivity
        ) as CachedActivity;
        if (expiresAt < new Date().getTime()) {
          fetchActivityFromDb();
        } else {
          setActivityData((prev) => ({ ...prev, ...data }));
        }
      } else {
        fetchActivityFromDb();
      }
    }

    if (!noCache) {
      fetchActivity();
    }
  }, []);

  return (
    <View
      style={[
        {
          backgroundColor: isActive ? Colors.dark.background : "transparent",
          padding: 5,
          // borderRadius: 10,
          marginVertical: 5,
          height: 100,
          flexDirection: "row",
          paddingHorizontal: 15,
          // marginHorizontal: 15,
        },
        style,
      ]}
    >
      <View
        style={{
          width: style && style.height !== undefined ? style.height - 10 : 90,
          height: "100%",
          position: "relative",
        }}
      >
        {/* <Image
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
          source={{
            uri: `https://storage.googleapis.com/favel-photos/activites/${activity.id}-400.jpg`,
          }}
        /> */}
        <ImageWithFallback
          key={activityData.id}
          style={{ width: "100%", height: "100%", borderRadius: 10 }}
          source={{
            uri: `https://storage.googleapis.com/favel-photos/activites/${activityData.id}-700.jpg`,
          }}
          fallbackSource={require("@/assets/images/adaptive-icon.png")}
        />
        <View
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            backgroundColor: categories.includes(
              activityData.category as Category
            )
              ? categoryColor[activityData.category as Category]
              : categoryColor.unknown,
            padding: 5,
            borderRadius: 5,
            width: 30,
            height: 30,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon
            icon={`${
              categories.includes(activityData.category as Category)
                ? (activityData.category as Category)
                : "unknown"
            }Icon`}
            size={15}
            color={"white"}
          />
        </View>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingVertical: 5,
          marginLeft: 15,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: "Outfit_600SemiBold",
              fontSize: 16,
              color: Colors[theme].primary,
            }}
          >
            {activityData.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              opacity: 0.8,
              color: Colors[theme].primary,
            }}
          >
            {activityData.display_category}
          </Text>
        </View>
        {activityData.avg_duration && (
          <Text
            style={{
              fontSize: 12,
              opacity: 0.8,
              color: Colors[theme].primary,
            }}
          >
            {formatHoursToHoursAndMinutes(activityData.avg_duration)} sur place
          </Text>
        )}
      </View>
      {draggable && (
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={{
            position: "absolute",
            right: 15,
            top: 40,
            zIndex: 1,
          }}
        >
          <Icon
            icon="dragIcon"
            size={20}
            color={Colors[theme].primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
