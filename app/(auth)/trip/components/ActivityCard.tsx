import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  PanResponder,
  Animated,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Activity, CachedActivity, Category } from "@/types/types";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { Text } from "@/components/Themed";
import { categories, colors as categoryColor } from "@/constants/categories";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatHoursToHoursAndMinutes } from "@/lib/utils";
import RouteCard from "./RouteCard";
import { RectButton, Swipeable } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTrip } from "@/context/tripContext";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-expo";
import PlaceCard from "./PlaceCard";

export default function ActivityCard({
  activity,
  drag,
  isActive,
  style,
  loading,
  onDelete,
  swipeable,
  theme = "dark",
  draggable,
  noCache,
}: {
  activity: Activity;
  drag?: any;
  isActive?: boolean;
  style?: any;
  loading?: boolean;
  onDelete?: () => void;
  swipeable?: boolean;
  theme?: "light" | "dark";
  draggable?: boolean;
  noCache?: boolean;
}) {
  return activity.route ? (
    <RouteCard
      route={activity.route}
      style={
        loading
          ? {
              padding: 10,
              marginVertical: 5,
              paddingHorizontal: 10,
              marginHorizontal: 10,
              backgroundColor: "transparent",
            }
          : {}
      }
    />
  ) : (
    <PlaceCard
      activity={activity}
      drag={drag}
      isActive={isActive}
      style={style}
      theme={theme}
      draggable={draggable}
      noCache={noCache}
      swipeable={swipeable}
      onDelete={onDelete}
    />
  );
}
