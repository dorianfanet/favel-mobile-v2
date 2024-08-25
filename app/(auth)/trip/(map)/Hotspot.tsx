import { View, Text } from "react-native";
import React from "react";
import Icon from "@/components/Icon";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function Hotspot({
  data,
  noImage,
}: {
  data: {
    id?: string;
    location: string;
    duration: number | (number | undefined)[] | undefined;
  };
  noImage?: boolean;
}) {
  return (
    <View
      style={{
        width: 150,
        height: 150,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          width: 55,
          height: 55,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: -30,
          }}
        >
          <View
            style={[
              {
                width: 55,
                height: 55,
              },
            ]}
          >
            <Icon
              icon="activitiesMapPin"
              size={55}
              color={"#205783"}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 3.5,
                width: 48,
                height: 48,
                borderRadius: 50,
                padding: 4,
                overflow: "hidden",
              }}
            >
              {data.id && !noImage ? (
                <ImageWithFallback
                  style={{ width: "100%", height: "100%", borderRadius: 50 }}
                  source={{
                    uri: `https://storage.googleapis.com/favel-photos/hotspots/${data.id}-700.jpg`,
                  }}
                  fallbackSource={require("@/assets/images/no-image.png")}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: -3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      fontFamily: "Outfit_600SemiBold",
                      textAlign: "center",
                    }}
                  >
                    {data.duration}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "white",
                      fontFamily: "Outfit_600SemiBold",
                      textAlign: "center",
                    }}
                  >
                    Jours
                  </Text>
                </View>
              )}
            </View>
            {!noImage &&
            !(Array.isArray(data.duration)
              ? data.duration.some((d) => d === undefined)
              : false) ? (
              <View
                style={{
                  position: "absolute",
                  top: -5,
                  right: -10,
                  backgroundColor: "#3b79ab",
                  // backgroundColor: "#426682",
                  borderRadius: 10,
                  padding: 3,
                  paddingHorizontal: 8,
                  alignSelf: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "white",
                    fontFamily: "Outfit_600SemiBold",
                    textAlign: "center",
                  }}
                >
                  {/* {Array.isArray(data.duration)
                    ? data.duration.map(
                        (d, i) =>
                          `${d}${
                            Array.isArray(data.duration) &&
                            i === data.duration.length - 1
                              ? " j"
                              : " + "
                          }`
                      )
                    : `${data.duration} j`} */}
                  {Array.isArray(data.duration)
                    ? data.duration.map(
                        (d, i) =>
                          `${d} ${d! > 1 ? "j" : "j"}${
                            Array.isArray(data.duration) &&
                            i === data.duration.length - 1
                              ? ""
                              : " + "
                          }`
                      )
                    : `${data.duration || "?"} j`}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: 35,
            width: 150,
          }}
        >
          <View
            style={[
              {
                backgroundColor: "#205783",
                // backgroundColor: "#426682",
                borderRadius: 7,
                padding: 2,
                paddingHorizontal: 4,
                alignSelf: "center",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 12,
                color: "white",
                fontFamily: "Outfit_600SemiBold",
                textAlign: "center",
              }}
            >
              {data.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
