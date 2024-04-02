import { View, FlatList } from "react-native";
import React from "react";
import { TripChatEdit, TripChatEditDay } from "@/types/types";
import { Text } from "@/components/Themed";
import ActivityCard from "../../components/ActivityCard";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";

export default function Edits({ edits }: { edits: TripChatEditDay[] }) {
  return edits ? (
    <View
      style={{
        marginTop: 20,
      }}
    >
      {edits.map((edit) => (
        <View
          key={edit.day_index}
          style={{
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Outfit_600SemiBold",
              color: "white",
            }}
          >
            {`Jour ${edit.day_index + 1}`}
          </Text>
          <View
            style={{
              marginVertical: 5,
            }}
          >
            {edit.actions.map((action) => (
              <EditCard
                key={action.name}
                edit={action}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  ) : null;
}

function EditCard({ edit }: { edit: TripChatEdit }) {
  return edit.id ? (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        position: "relative",
        marginVertical: 5,
      }}
    >
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: editTypes[edit.action],
          opacity: 0.3,
          borderRadius: 10,
        }}
      />
      <Icon
        icon={`${edit.action}Icon`}
        size={20}
        color={editTypes[edit.action]}
        style={{
          marginLeft: 10,
        }}
      />
      <ActivityCard
        activity={{
          id: edit.id,
          name: edit.name,
          formattedType: "activity",
        }}
        style={{
          paddingHorizontal: 0,
          flex: 1,
        }}
      />
    </View>
  ) : null;
}
