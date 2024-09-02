import {
  View,
  DimensionValue,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
  Share,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { Activity, FormattedTrip, Route, Trip, TripEdit } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { FlatList } from "react-native-gesture-handler";
import { ScrollView } from "react-native-gesture-handler";
import { BlurView, Text } from "@/components/Themed";
import { useEditor } from "@/context/editorContext";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { getActivity, updateTripFromFormatted } from "@/lib/supabase";
import DayCard from "../components/DayCard";
import ActivityCard from "../components/ActivityCard";
import { newTripEdit } from "@/lib/tripEdits";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Animated from "react-native-reanimated";
import ContainedButton from "@/components/ContainedButton";
import Icon from "@/components/Icon";
import { padding } from "@/constants/values";
import { track } from "@amplitude/analytics-react-native";
import ShareCTA from "../components/ShareCTA";
import { useTripUserRole } from "@/context/tripUserRoleContext";

const windowHeight = Dimensions.get("window").height;

export default function TripBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const flatListHeight = useRef<number>(0);

  const { user } = useUser();

  const snapPoints = useMemo(() => ["10%", "45%", "100%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const inset = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);

  const { trip, tripMetadata } = useTrip();
  const { tripUserRole } = useTripUserRole();

  const [formattedTrip, setFormattedTrip] = useState<FormattedTrip>();

  useEffect(() => {
    if (!trip) return;

    bottomSheetRef.current?.present();

    let temp: FormattedTrip = [];

    trip.forEach((day, index) => {
      temp.push({
        id: day.id,
        location: day.location,
        country: day.country,
        day: index,
        hotspotId: day.hotspotId,
        formattedType: "day",
        type: day.type,
        origin: day.origin,
        destination: day.destination,
        coordinates: day.coordinates,
        transfer: day.transfer,
        origin_coordinates: day.origin_coordinates,
      });

      if (day.activities) {
        day.activities.forEach((activity) => {
          temp.push({
            ...(activity as Activity),
            index: index,
            dayId: day.id,
          });
        });
      }
    });

    setFormattedTrip(temp);

    function updateListHeight() {
      const dayCardHeight = 60;
      const activityCardHeight = 100;

      let totalHeight = trip?.length || 0 * dayCardHeight;

      trip?.forEach((day) => {
        totalHeight += (day.activities?.length || 0) * activityCardHeight;
      });

      flatListHeight.current = totalHeight;
    }
    updateListHeight();
  }, [trip]);

  const scrollOffset = useRef<number>(0);
  const bottomSheetOffset = useRef<number>(10000);

  function handleScroll(offset: number) {
    scrollOffset.current = offset;
    if (offset < -20) {
      bottomSheetRef.current?.snapToIndex(1);
    } else if (offset > bottomSheetOffset.current + 50) {
      bottomSheetRef.current?.snapToIndex(2);
    }
  }

  useEffect(() => {
    if (!bottomSheetRef.current) return;
    if (tripMetadata && tripMetadata.status.includes("loading")) {
      bottomSheetRef.current?.close();
    } else {
      try {
        bottomSheetRef.current?.snapToIndex(1);
      } catch (error) {
        console.log(error);
      }
    }
  }, [tripMetadata?.status]);

  const { editor } = useEditor();

  const { getToken } = useAuth();

  useEffect(() => {
    if (editor) {
      if (editor.type === "day" && formattedTrip && !editor.noScroll) {
        const index = formattedTrip.findIndex(
          (item) => item.id === editor.day.id
        );

        flatListRef.current?.scrollToIndex({
          index: index,
          animated: true,
        });
      } else if (editor.type === "activity" && formattedTrip) {
        const index = formattedTrip.findIndex(
          (item) => item.id === editor.activity.id
        );

        flatListRef.current?.scrollToIndex({
          index: index,
          animated: true,
        });

        if (!editor.scrollOnly) {
          bottomSheetRef.current?.close();
        }
      }
    } else {
      setTimeout(() => {
        if (bottomSheetRef.current) {
          try {
            bottomSheetRef.current.snapToIndex(1);
          } catch (error) {
            console.log(error);
          }
        }
      }, 200);
    }
  }, [editor]);

  function updateFormattedTrip(newTrip: FormattedTrip, to: number) {
    if (to === 0) return;
    if (newTrip[0].formattedType !== "day") {
      let temp = newTrip[0];
      newTrip[0] = newTrip[1];
      newTrip[1] = temp;
    }

    let daysIndexes: number[] = [];
    newTrip.forEach((item, index) => {
      if (item.formattedType === "day") {
        daysIndexes.push(index);
      }
    });

    function findIndexOfPreviousIndex(indexes: number[], number: number) {
      let previousIndexValue = -1;
      let previousIndexPosition = -1;

      for (let i = 0; i < indexes.length; i++) {
        if (indexes[i] >= number) {
          return {
            previousIndexValue: previousIndexValue,
            previousIndexPosition: previousIndexPosition,
          };
        }
        previousIndexValue = indexes[i];
        previousIndexPosition = i;
      }

      return {
        previousIndexValue: previousIndexValue,
        previousIndexPosition: previousIndexPosition,
      };
    }

    const toDayIndex = findIndexOfPreviousIndex(daysIndexes, to);

    if (trip && tripMetadata && tripMetadata.id && tripMetadata.post_id) {
      const data: TripEdit = {
        type: "move",
        day_index: toDayIndex.previousIndexPosition,
        location: trip[toDayIndex.previousIndexPosition].location,
        activity_id: newTrip[to].id!,
        author_id: user?.id!,
        trip_id: tripMetadata?.id!,
        post_id: tripMetadata?.post_id,
      };

      newTripEdit({ ...data, getToken });
      setFormattedTrip(newTrip);
      updateTripFromFormatted(newTrip, tripMetadata.id);
    }
  }

  function deleteActivity(activity: Activity) {
    const index = formattedTrip?.findIndex((item) => item.id === activity.id);
    if (index && tripMetadata && tripMetadata.id) {
      const temp = [...formattedTrip!];
      temp.splice(index, 1);
      setFormattedTrip(temp);
      updateTripFromFormatted(temp, tripMetadata.id);
    }
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundComponent={(props) => (
        <View
          style={{
            flex: 1,
            padding: 0,
            margin: 0,
          }}
          {...props}
        >
          <BlurView
            tint="light"
            style={{
              borderWidth: 1,
              borderColor: Colors.light.bottomSheetBorder,
              backgroundColor: Colors.light.blurBackground,
              borderRadius: 30,
              // backgroundColor: "#eef8feb4",
            }}
          />
        </View>
      )}
      topInset={inset.top}
      handleComponent={() => (
        <Animated.View
          style={{
            height: 30,
          }}
        >
          <View
            style={{
              height: 30,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: Colors.light.primary,
                width: 40,
                height: 5,
                borderRadius: 2.5,
              }}
            />
          </View>
        </Animated.View>
      )}
    >
      {formattedTrip && (
        <DraggableFlatList
          onScrollOffsetChange={handleScroll}
          onEndReached={() => {
            bottomSheetOffset.current = scrollOffset.current;
          }}
          data={formattedTrip}
          ref={flatListRef}
          renderItem={({ item, drag, isActive }) => {
            return item.formattedType === "day" ? (
              <>
                <DayCard day={item} />
              </>
            ) : (
              <>
                <ActivityCard
                  theme="light"
                  activity={item}
                  drag={drag}
                  isActive={isActive}
                  onDelete={() => deleteActivity(item as Activity)}
                  draggable={tripUserRole.role === "read-only" ? false : true}
                  swipeable={tripUserRole.role === "read-only" ? false : true}
                  highlighted={
                    editor && editor.type === "activity"
                      ? editor.activity.id === item.id
                        ? true
                        : false
                      : undefined
                  }
                />
              </>
            );
          }}
          keyExtractor={(item, index) =>
            item.formattedType === "day"
              ? `${item.location!}${item.day!}-${index}`
              : `${item.id!}-${index}`
          }
          onDragEnd={({ data, from, to }) => updateFormattedTrip(data, to)}
          ListFooterComponent={() => (
            <View
              style={{
                height: 150 + windowHeight * 0.35,
                paddingHorizontal: padding,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ShareCTA />
            </View>
          )}
          onDragBegin={() => {
            bottomSheetRef.current?.snapToIndex(2);
          }}
        />
      )}
    </BottomSheetModal>
  );
}
