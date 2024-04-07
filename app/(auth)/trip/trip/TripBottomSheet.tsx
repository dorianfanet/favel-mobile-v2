import {
  View,
  Text,
  DimensionValue,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
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
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { Activity, FormattedTrip, Route, Trip, TripEdit } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { FlatList } from "react-native-gesture-handler";
import { ScrollView } from "react-native-gesture-handler";
import { BlurView } from "@/components/Themed";
import { useEditor } from "@/context/editorContext";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useUser } from "@clerk/clerk-expo";
import { getActivity, updateTripFromFormatted } from "@/lib/supabase";
import DayCard from "../components/DayCard";
import ActivityCard from "../components/ActivityCard";
import { newTripEdit } from "@/lib/tripEdits";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TripBottomSheet() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sheetIndex, setSheetIndex] = useState(1);

  const { user } = useUser();

  const snapPoints = useMemo(() => ["10%", "45%", "100%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
    setSheetIndex(index);
  }, []);

  const inset = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);

  const { trip, tripMetadata } = useTrip();

  const [formattedTrip, setFormattedTrip] = useState<FormattedTrip>();

  useEffect(() => {
    if (!trip) return;

    let temp: FormattedTrip = [];

    trip.forEach((day, index) => {
      temp.push({
        id: day.id,
        location: day.location,
        country: day.country,
        day: index,
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
          });
        });
      }
    });

    setFormattedTrip(temp);
  }, [trip]);

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    console.log("handleScroll", e.nativeEvent.contentOffset.y);
    const flatListHeight = e.nativeEvent.contentSize.height;
    const flatListHeight2 = e.nativeEvent.layoutMeasurement.height;
    if (e.nativeEvent.contentOffset.y < -20) {
      bottomSheetRef.current?.snapToIndex(1);
    } else if (
      e.nativeEvent.contentOffset.y >
      flatListHeight - flatListHeight2
    ) {
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

  useEffect(() => {
    if (editor && editor.day && formattedTrip) {
      const index = formattedTrip.findIndex(
        (item) => item.id === editor.day?.id
      );

      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
      });
    }
  }, [editor]);

  function updateFormattedTrip(newTrip: FormattedTrip, to: number) {
    if (newTrip[0].formattedType !== "day") {
      // move the second item to the first position
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

      // Return the last index and its position if the given number is greater than all indexes
      return {
        previousIndexValue: previousIndexValue,
        previousIndexPosition: previousIndexPosition,
      };
    }

    const toDayIndex = findIndexOfPreviousIndex(daysIndexes, to);

    if (trip && tripMetadata && tripMetadata.id) {
      const data: TripEdit = {
        type: "move",
        day_index: toDayIndex.previousIndexPosition,
        location: trip[toDayIndex.previousIndexPosition].location,
        activity_id: newTrip[to].id!,
        author_id: user?.id!,
        trip_id: tripMetadata?.id!,
      };

      newTripEdit(data);
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
    <BottomSheet
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
          <BlurView />
        </View>
      )}
      handleIndicatorStyle={{
        backgroundColor: "white",
      }}
      topInset={inset.top}
    >
      {formattedTrip && (
        <DraggableFlatList
          onScroll={handleScroll}
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
                  activity={item}
                  drag={drag}
                  isActive={isActive}
                  onDelete={() => deleteActivity(item as Activity)}
                  draggable
                  swipeable
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
          contentContainerStyle={{
            paddingBottom: 80,
          }}
        />
      )}
    </BottomSheet>
  );
}
