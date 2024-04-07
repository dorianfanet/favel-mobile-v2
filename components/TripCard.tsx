import { View, StyleSheet, Pressable } from "react-native";
import React, { useEffect } from "react";
import { SavedTrip, UserMetadata } from "@/types/types";
import { supabase } from "@/lib/supabase";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { Text } from "./Themed";
import { formatTimestamps, getUserMetadata } from "@/lib/utils";
import { borderRadius } from "@/constants/values";
import ImageWithFallback from "./ImageWithFallback";
import { months } from "@/constants/data";
import Colors from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";

export default function TripCard({ trip }: { trip: SavedTrip }) {
  const { user } = useUser();

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
          {trip.author_id !== user?.id && (
            <CreatedBy authorId={trip.author_id} />
          )}
        </Pressable>
      </Link>
    </View>
  );
}

function CreatedBy({ authorId }: { authorId: string }) {
  const [author, setAuthor] = React.useState<UserMetadata | null>(null);

  useEffect(() => {
    async function fetchAuthor() {
      const user = await getUserMetadata(authorId);

      setAuthor({
        id: user?.id,
        firstName: user?.firstName || "Anonyme",
        lastName: user?.lastName,
        imageUrl: user?.imageUrl,
      });
    }
    fetchAuthor();
  }, [authorId]);

  return (
    <View
      style={{
        marginTop: 15,
      }}
    >
      {/* <Text
        style={{
          fontSize: 14,
          color: Colors.light.primary,
          opacity: 0.8,
          fontFamily: "Outfit_400Regular",
          marginBottom: 5,
        }}
      >
        Crée par
      </Text> */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: author?.imageUrl }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            // marginLeft: 10,
            marginRight: 5,
          }}
        />
        <Text>
          {author?.firstName} {author?.lastName}
        </Text>
      </View>
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
