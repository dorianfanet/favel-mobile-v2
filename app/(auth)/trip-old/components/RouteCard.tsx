import { View, Text, StyleSheet } from "react-native";
import React, { useState } from "react";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import { Path, Svg } from "react-native-svg";
import { Activity, Day, Route } from "@/types/types";
import { secondsToHoursMinutes } from "@/lib/utils";

export default function RouteCard({
  style,
  route,
}: {
  style?: any;
  route: Route;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDetails = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View
      style={[
        {
          padding: 10,
          // borderRadius: 10,
          marginVertical: 5,
          // height: 100,
          marginHorizontal: 15,
          // marginHorizontal: 15,
          backgroundColor: "#1d4561",
          borderRadius: 10,
        },
        style,
      ]}
    >
      {/* <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      > */}
      <View
        style={{
          flexDirection: "row",
          gap: 15,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            backgroundColor: Colors.map[route ? route.type : "driving"],
            padding: 4,
            borderRadius: 5,
            justifyContent: "center",
            alignItems: "center",
            flex: 0,
          }}
        >
          <Icon
            icon={`${route ? route.type : "driving"}Icon`}
            size={28}
            color={Colors.dark.primary}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            Trajet en {route && route.type === "driving" ? "voiture" : "train"}
          </Text>
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
              {secondsToHoursMinutes(route?.duration || 0)}
            </Text>
            <Text
              style={{
                color: Colors.dark.primary,
                fontSize: 12,
                fontFamily: "Outfit_400Regular",
                opacity: 0.8,
              }}
            >
              {Math.floor(route?.distance / 1000)} km
            </Text>
          </View>
        </View>
      </View>
      {/* <View>
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            {secondsToHoursMinutes(route?.duration || 0)}
          </Text>
        </View> */}
      {/* </View> */}
      {/* <View style={styles.cardContainer}>
        <View style={styles.lineContainer}>
          <View style={styles.dot} />
          <View
            style={{
              width: 6,
              height: 35,
              backgroundColor: "#ffffff",
            }}
          >
            <View
              style={[
                styles.line,
                {
                  backgroundColor: Colors.map[route ? route.type : "driving"],
                },
              ]}
            />
          </View>

          <View style={styles.dot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cities}>{route.origin}</Text>
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 12,
              fontFamily: "Outfit_400Regular",
              opacity: 0.8,
            }}
          >
            {secondsToHoursMinutes(route?.duration || 0)}
          </Text>
          <Text style={styles.cities}>{route.destination}</Text>
        </View>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 5,
    // Add more styling as needed
  },
  lineContainer: {
    alignItems: "center",
    width: 36, // Adjust based on your needs
    marginRight: 10,
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: Colors.dark.primary,
  },
  line: {
    width: 4,
    height: 35, // Adjust based on your needs
    position: "absolute",
    left: 1,
  },
  textContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    height: 65,
  },
  cities: {
    color: Colors.dark.primary,
    fontSize: 14,
    fontFamily: "Outfit_500Medium",
  },
});
