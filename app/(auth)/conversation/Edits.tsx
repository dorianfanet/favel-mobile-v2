import { View, FlatList } from "react-native";
import React, { useMemo } from "react";
import { TripChatEdit, TripChatEditDay } from "@/types/types";
import { Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import Colors from "@/constants/Colors";
import { ActivityCardContent } from "../trip/components/PlaceCard";

// const theme = {
//   light: {
//     primary: Colors.light.primary,
//   },
//   dark: {
//     primary: Colors.dark.primary,
//   },
// };

export default function Edits({
  edits,
  noMargin,
  theme = "light",
}: {
  edits: TripChatEditDay[];
  noMargin?: boolean;
  theme?: "light" | "dark";
}) {
  return edits ? (
    <View
      style={{
        marginTop: noMargin ? 0 : 20,
      }}
    >
      {edits.map((edit, index) => (
        <Edit
          key={`${edit.day_index}-${index}`}
          edit={edit}
          theme={theme}
        />
      ))}
    </View>
  ) : null;
}

function Edit({
  edit,
  theme,
}: {
  edit: TripChatEditDay;
  theme: "light" | "dark";
}) {
  const difference = useMemo(() => {
    if (!edit.day_action?.move) return { difference: 0, movement: "no change" };

    const from = edit.day_action.move.from;
    const to = edit.day_action.move.to;

    let difference = Math.abs(from - to);

    let movement = from < to ? "down" : "up";

    if (from === to) {
      movement = "no change";
    }

    return { difference, movement };
  }, [edit]);

  return (
    <View
      key={edit.day_index}
      style={{
        borderRadius: 10,
        marginBottom: 10,
        position: "relative",
      }}
    >
      {/* <View
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: edit.day_action
          ? editTypes[edit.day_action.action]
          : // : "#44c1e752",
          "#fa9999"
          "#6ff18b"
            Colors.light.background,
        // backgroundColor: Colors.dark.secondary,
        // backgroundColor: editTypes["add"],
        opacity: edit.day_action ? 0.3 : 1,
        borderRadius: 10,
        borderBottomLeftRadius: edit.actions.length > 0 ? 20 : 10,
        borderBottomRightRadius: edit.actions.length > 0 ? 20 : 10,
        // borderTopLeftRadius: 10,
        // borderTopRightRadius: 10,
      }}
    /> */}
      <View
        style={{
          padding: 0,
          paddingBottom: 0,
        }}
      >
        {edit.day_index !== undefined ? (
          <View
          // style={{
          //   flexDirection: "row",
          //   justifyContent: "space-between",
          //   alignItems: "center",
          // }}
          >
            {/* {edit.day_action?.action === "move" && edit.day_action.move ? (
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
                  color: Colors.light.primary,
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
                  color: Colors.light.primary,
                }}
              >
                {`Jour ${edit.day_action.move.to + 1}`}
              </Text>
            </View>
          ) : ( */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {edit.day_action ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      alignContent: "center",
                    }}
                  >
                    {/* <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Outfit_600SemiBold",
                          // color: editTypes[edit.action],
                          color: Colors.light.primary,
                        }}
                      >
                        {edit.day_action.action === "delete"
                          ? "Suppression"
                          : edit.day_action.action === "add"
                          ? "Ajout"
                          : "Déplacement"}
                      </Text> */}

                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 20,
                        backgroundColor: editTypes[edit.day_action.action],
                        marginLeft: 5,
                        width: 20,
                        height: 20,
                      }}
                    >
                      <Icon
                        icon={`${
                          edit.day_action.action === "delete"
                            ? "minus"
                            : edit.day_action.action === "add"
                            ? "plus"
                            : "move"
                        }Icon`}
                        size={edit.day_action.action === "move" ? 10 : 12}
                        color={Colors[theme].primary}
                        // color={editTypes[edit.action]}
                      />
                    </View>
                  </View>
                ) : null}
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Outfit_600SemiBold",
                    color: Colors[theme].primary,
                  }}
                >
                  {`Jour ${edit.day_index + 1}`}
                </Text>
                {edit.day_action?.action === "move" && edit.day_action.move ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Icon
                      icon="downArrowIcon"
                      size={18}
                      color={
                        difference.movement === "down"
                          ? editTypes["add"]
                          : editTypes["delete"]
                      }
                      style={{
                        transform: [
                          {
                            rotate:
                              difference.movement === "up" ? "180deg" : "0deg",
                          },
                        ],
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Outfit_500Medium",
                        color:
                          difference.movement === "down"
                            ? editTypes["add"]
                            : editTypes["delete"],
                      }}
                    >
                      {difference.movement === "down" ? "+" : "-"}{" "}
                      {difference.difference}
                    </Text>
                  </View>
                ) : null}
              </View>
              {/* <View
                style={{
                  // flexDirection: "row",
                  gap: 5,
                  // alignItems: "center",
                }}
              > */}
              {/* </View> */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                }}
              >
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
                    color={Colors[theme].primary}
                  />
                  <Text
                    style={{
                      color: Colors[theme].primary,
                    }}
                  >
                    {edit.location}
                  </Text>
                </View>
              </View>
            </View>
            {/* )} */}
          </View>
        ) : null}
        {edit.actions ? (
          <View
            style={{
              marginVertical: 5,
            }}
          >
            {edit.actions.map((action) => (
              <EditCard
                key={action.name}
                edit={action}
                theme={theme}
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function EditCard({
  edit,
  theme,
}: {
  edit: TripChatEdit;
  theme: "light" | "dark";
}) {
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
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 20,
              backgroundColor: editTypes[edit.action],
              marginRight: 5,
              width: 16,
              height: 16,
            }}
          >
            <Icon
              icon={`${
                edit.action === "delete"
                  ? "minus"
                  : edit.action === "add"
                  ? "plus"
                  : "move"
              }Icon`}
              size={edit.action === "delete" ? 12 : 10}
              color={Colors[theme].primary}
              // color={editTypes[edit.action]}
              style={{}}
            />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontFamily: "Outfit_600SemiBold",
              // color: editTypes[edit.action],
              color: Colors[theme].primary,
            }}
          >
            {edit.action === "delete"
              ? "Suppression"
              : edit.action === "add"
              ? "Ajout"
              : "Déplacement"}
          </Text>
        </View>
        <ActivityCardContent
          activity={{
            id: edit.id,
            name: edit.name,
            formattedType: "activity",
          }}
          style={{
            paddingHorizontal: 0,
          }}
          noClick
          theme={theme}
        />
      </View>
    </View>
  ) : null;
}
