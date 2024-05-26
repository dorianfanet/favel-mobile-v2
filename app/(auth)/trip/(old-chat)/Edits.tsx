import { View, FlatList } from "react-native";
import React from "react";
import { TripChatEdit, TripChatEditDay } from "@/types/types";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import Colors from "@/constants/Colors";
import EditCard from "../components/EditCard";

export default function Edits({
  edits,
  noMargin,
}: {
  edits: TripChatEditDay[];
  noMargin?: boolean;
}) {
  return edits ? (
    <View
      style={{
        marginTop: noMargin ? 0 : 20,
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
            {edit.day_index !== undefined ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {edit.day_action?.action === "move" && edit.day_action.move ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Outfit_600SemiBold",
                        color: "white",
                      }}
                    >
                      {`Jour ${edit.day_action.move.from + 1}`}
                    </Text>
                    <Icon
                      icon="moveIcon"
                      size={16}
                      color={Colors.dark.primary}
                      style={{
                        transform: [{ rotate: "90deg" }],
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Outfit_600SemiBold",
                        color: "white",
                      }}
                    >
                      {`Jour ${edit.day_action.move.to + 1}`}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      fontSize: 18,
                      fontFamily: "Outfit_600SemiBold",
                      color: "white",
                    }}
                  >
                    {`Jour ${edit.day_index + 1}`}
                  </Text>
                )}
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
            ) : null}
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
