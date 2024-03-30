import { Pressable, View } from "react-native";
import React from "react";
import { Day } from "@/types/types";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { useEditor } from "@/context/editorContext";

export default function DayCard({ day }: { day: Day }) {
  const { setEditor } = useEditor();

  return (
    <Pressable
      onPress={() => {
        // setEditor({
        //   type: "day",
        //   dayId: day.id,
        // });
      }}
    >
      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 10,
          flexDirection: "row",
          justifyContent: "space-between",
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
        {day.type === "day" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Icon
              icon="mapPinIcon"
              size={16}
              color={Colors.dark.primary}
            />
            <Text
              style={{
                color: Colors.dark.primary,
              }}
            >
              {day.location}
            </Text>
          </View>
        )}
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
        )}
      </View>
    </Pressable>
  );
}
