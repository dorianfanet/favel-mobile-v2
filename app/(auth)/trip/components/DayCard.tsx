import { Pressable, TouchableOpacity, View } from "react-native";
import React from "react";
import { Day } from "@/types/types";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { useEditor } from "@/context/editorContext";
import { getBoundsOfDay } from "@/lib/utils";
import { useTrip } from "@/context/tripContext";
import { BBox } from "@turf/turf";
import { useCamera } from "@/context/cameraContext";

export default function DayCard({ day }: { day: Day }) {
  const { setEditor } = useEditor();
  const { trip, tripMetadata } = useTrip();

  return (
    <TouchableOpacity
      style={{
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onPress={() => {
        const activities = trip?.find(
          (tripDay) => tripDay.id === day.id
        )?.activities;
        console.log(activities);
        let bounds: BBox | undefined = undefined;
        if (activities && activities?.length > 1) {
          bounds = getBoundsOfDay(activities);
          console.log(bounds);
        }
        setEditor({
          type: "day",
          day: {
            id: day.id!,
            center: day.coordinates!,
            bounds: bounds,
          },
        });
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontFamily: "Outfit_700Bold",
          color: Colors.dark.primary,
        }}
      >
        Jour {typeof day.day === "number" ? day.day + 1 : ""}
      </Text>
      <Pressable
      // onPress={() => {
      //   setEditor({
      //     type: "day",
      //     day: {
      //       id: day.id!,
      //       center: day.coordinates!,
      //     },
      //   });
      // }}
      >
        {/* {day.type === "day" && ( */}
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            gap: 5,
          }}
        >
          <View
            style={{
              alignItems: "flex-end",
            }}
          >
            <Text
              style={{
                color: Colors.dark.primary,
                fontSize: 16,
                fontFamily: "Outfit_600SemiBold",
              }}
            >
              {
                tripMetadata?.route?.find((route) => route.id === day.hotspotId)
                  ?.location
              }
              {/* {day.location} */}
            </Text>
            <Text
              style={{
                color: Colors.dark.primary,
                fontSize: 12,
                opacity: 0.8,
                fontFamily: "Outfit_500Medium",
              }}
            >
              {day.location}
            </Text>
          </View>
          <Icon
            icon="mapPinIcon"
            size={16}
            color={Colors.dark.primary}
          />
        </View>
        {/* )}
        {day.type === "transfer" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Text
              style={{
                color: Colors.dark.primary,
              }}
            >
              {day.origin}
            </Text>
            <Icon
              icon="chevronRightDoubleIcon"
              size={16}
              color={Colors.dark.primary}
            />
            <Text
              style={{
                color: Colors.dark.primary,
              }}
            >
              {day.destination}
            </Text>
          </View>
        )} */}
      </Pressable>
    </TouchableOpacity>
  );
}
