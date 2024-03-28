import { View, StyleSheet, Pressable } from "react-native";
import React, { useEffect } from "react";
import { SavedTrip } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Text } from "./Themed";
import { formatTimestamps } from "@/lib/utils";
import { borderRadius } from "@/constants/values";
import ImageWithFallback from "./ImageWithFallback";
import { months } from "@/constants/data";
import Colors from "@/constants/Colors";

export default function TripCard({ trip }: { trip: SavedTrip }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        width: "100%",
        padding: 20,
      }}
    >
      <Link
        href={`/(auth)/trip/${trip.id}`}
        asChild
      >
        <Pressable>
          <View
            style={{
              marginBottom: 20,
            }}
          >
            <Text style={styles.tripName}>{trip.name}</Text>
            {trip.dates && trip.dates.type === "flexDates" && (
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.light.primary,
                  opacity: 0.8,
                  fontFamily: "Outfit_400Regular",
                }}
              >
                {`${trip.dates.duration} jours en ${months[trip.dates.month]}`}
              </Text>
            )}
          </View>
          <View style={{ height: 200 }}>
            <View style={styles.mainContainer}>
              <View style={{ ...styles.blockA, ...styles.thumbnail }}>
                <Image
                  source={{
                    uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[0]?.id}-700.jpg`,
                  }}
                  style={{ flex: 1 }}
                />
              </View>
              {trip.route && trip.route.length > 1 && (
                <View style={styles.rightSideContainer}>
                  <View style={{ ...styles.thumbnail }}>
                    <Image
                      source={{
                        uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[1]?.id}-700.jpg`,
                      }}
                      style={{ flex: 1 }}
                    />
                  </View>
                  {trip.route.length > 2 && (
                    <View style={{ ...styles.thumbnail }}>
                      <Image
                        source={{
                          uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[2]?.id}-700.jpg`,
                        }}
                        style={{ flex: 1 }}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  tripName: {
    fontSize: 18,
    fontFamily: "Outfit_600SemiBold",
  },
  thumbnail: {
    flex: 1,
    backgroundColor: "#00000010",
    borderRadius: borderRadius,
    overflow: "hidden",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  blockA: {
    flex: 2, // 67% width
    backgroundColor: "red", // Change as needed
    // Height is automatically 100% of the main container
  },
  rightSideContainer: {
    flex: 1, // 33% width
    gap: 10,
  },
});
