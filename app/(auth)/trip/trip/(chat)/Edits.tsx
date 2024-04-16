import { View, FlatList } from "react-native";
import React from "react";
import { TripChatEdit, TripChatEditDay } from "@/types/types";
import { Text } from "@/components/Themed";
import ActivityCard from "../../components/ActivityCard";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import { ActivityCardContent } from "../../components/PlaceCard";
import Colors from "@/constants/Colors";

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
            position: "relative",
          }}
        >
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: edit.day_action
                ? editTypes[edit.day_action.action]
                : Colors.dark.secondary,
              // backgroundColor: Colors.dark.secondary,
              // backgroundColor: editTypes["add"],
              opacity: 0.3,
              borderRadius: 10,
              borderBottomLeftRadius: edit.actions.length > 0 ? 20 : 10,
              borderBottomRightRadius: edit.actions.length > 0 ? 20 : 10,
              // borderTopLeftRadius: 10,
              // borderTopRightRadius: 10,
            }}
          />
          <View
            style={{
              padding: 10,
              paddingBottom: 0,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
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
                  {edit.location}
                </Text>
              </View>
            </View>
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
      <View
        style={{
          flex: 1,
        }}
      >
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
