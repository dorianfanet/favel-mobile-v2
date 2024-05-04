import { View } from "react-native";
import React from "react";
import { TripChatEdit } from "@/types/types";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import { ActivityCardContent } from "./PlaceCard";
import Colors from "@/constants/Colors";
import { formatTimestamp } from "@/lib/utils";
import UserCard from "@/components/UserCard";

export default function EditCard({ edit }: { edit: TripChatEdit }) {
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
      <View
        style={{
          flex: 1,
          marginLeft: 10,
          marginTop: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: -5,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Outfit_600SemiBold",
              // color: editTypes[edit.action],
              color: "white",
            }}
          >
            {edit.action === "delete"
              ? "Supprimé"
              : edit.action === "add"
              ? "Ajouté"
              : "Déplacé"}
          </Text>

          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: editTypes[edit.action],
              marginLeft: 5,
              width: 16,
              height: 16,
            }}
          >
            <Icon
              icon={`${
                edit.action === "delete"
                  ? "close"
                  : edit.action === "add"
                  ? "check"
                  : "move"
              }Icon`}
              size={edit.action === "move" ? 10 : 12}
              color={"white"}
              // color={editTypes[edit.action]}
              style={{}}
            />
          </View>
        </View>

        <ActivityCardContent
          activity={{
            id: edit.id,
            name: edit.name,
            formattedType: "activity",
          }}
          style={{
            paddingHorizontal: 0,
            flex: 1,
          }}
          noClick
        />
      </View>
    </View>
  ) : null;
}
