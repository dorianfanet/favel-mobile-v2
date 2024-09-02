import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { SavedTrip, UserMetadata } from "@/types/types";
import { Link } from "expo-router";
import { Image } from "expo-image";
import { BlurView, Text } from "./Themed";
import { getUserMetadata } from "@/lib/utils";
import { borderRadius } from "@/constants/values";
import { months } from "@/constants/data";
import Colors from "@/constants/Colors";
import Icon from "./Icon";
import { MMKV } from "@/app/_layout";
import { useAuth } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { useTranslation } from "react-i18next";

export default function TripCard({
  tripId,
  onTripChange,
  postId,
}: {
  tripId: string;
  onTripChange?: (trip: SavedTrip) => void;
  postId: string;
}) {
  const { t } = useTranslation();
  const [trip, setTrip] = useState<SavedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  async function updateTrip() {
    supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("trips_v2")
        .select("id, name, author_id, dates, route, invited_ids")
        .eq("id", tripId);

      if (error) {
        console.error("Error:", error);
        setError(error.message);
        setLoading(false);
      } else {
        console.log("Data:", data);
        setTrip(data[0]);
        onTripChange && onTripChange(data[0]);
        setLoading(false);
        MMKV.setString(`trip-metadata-${tripId}`, JSON.stringify(data[0]));
      }
    });
  }

  useEffect(() => {
    const cache = MMKV.getString(`trip-metadata-${tripId}`);
    setTrip(cache ? JSON.parse(cache) : null);
    onTripChange && onTripChange(cache ? JSON.parse(cache) : null);
    updateTrip();
  }, []);

  return trip ? (
    <View>
      <Link
        href={`/post/${postId}`}
        asChild
      >
        <TouchableOpacity
          style={{
            marginBottom: 15,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            {trip.name}
          </Text>
          {trip.dates && trip.dates.type === "flexDates" && (
            <Text
              style={{
                fontSize: 12,
                color: Colors.light.primary,
                opacity: 0.8,
                fontFamily: "Outfit_400Regular",
              }}
            >
              {t("date.day", {
                count: Number(trip.dates.duration),
              })}
            </Text>
          )}
        </TouchableOpacity>
      </Link>
      <Link
        href={`/(auth)/trip/${trip.id}`}
        asChild
      >
        <TouchableOpacity>
          <View style={{ height: 200 }}>
            <View style={styles.mainContainer}>
              {trip.route && trip.route[0] && (
                <View style={{ ...styles.blockA, ...styles.thumbnail }}>
                  <Image
                    source={{
                      uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[0]?.id}-700.jpg`,
                    }}
                    style={{ flex: 1 }}
                  />
                  <LocationCard location={trip.route[0].location} />
                </View>
              )}
              {trip.route && trip.route.length > 1 && (
                <View style={styles.rightSideContainer}>
                  <View style={{ ...styles.thumbnail }}>
                    <Image
                      source={{
                        uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[1]?.id}-700.jpg`,
                      }}
                      style={{ flex: 1 }}
                    />
                    <LocationCard location={trip.route[1].location} />
                  </View>
                  {trip.route.length > 2 && (
                    <View style={{ ...styles.thumbnail }}>
                      <Image
                        source={{
                          uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[2]?.id}-700.jpg`,
                        }}
                        style={{ flex: 1 }}
                      />
                      <LocationCard location={trip.route[2].location} />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Link>
      {trip.invited_ids && (
        <WithList
          invitedIds={trip.invited_ids}
          authorId={trip.author_id}
          tripId={trip.id}
        />
      )}
    </View>
  ) : loading ? (
    <View>
      <View
        style={{
          marginBottom: 15,
        }}
      >
        {/* <Skeleton
          width={"70%"}
          height={22}
        />
        <Skeleton
          width={"30%"}
          height={16}
        /> */}
        <View
          style={{
            width: "70%",
            height: 22,
            backgroundColor: "#00000010",
            borderRadius: 5,
            marginBottom: 5,
          }}
        />
        <View
          style={{
            width: "30%",
            height: 16,
            backgroundColor: "#00000010",
            borderRadius: 5,
          }}
        />
      </View>
      <View style={{ height: 200 }}>
        <View style={styles.mainContainer}>
          <View style={{ ...styles.blockA, ...styles.thumbnail }}>
            {/* <Skeleton
              width={"100%"}
              height={"100%"}
            /> */}
          </View>
          <View style={styles.rightSideContainer}>
            <View style={{ ...styles.thumbnail }}>
              {/* <Skeleton
                width={"100%"}
                height={"100%"}
              /> */}
            </View>
            <View style={{ ...styles.thumbnail }}>
              {/* <Skeleton
                width={"100%"}
                height={"100%"}
              /> */}
            </View>
          </View>
        </View>
      </View>
    </View>
  ) : error ? (
    <Text>Une erreur est survenue...</Text>
  ) : null;
}

function WithList({
  invitedIds,
  authorId,
  tripId,
}: {
  invitedIds: string[];
  authorId: string;
  tripId: string;
}) {
  const { t } = useTranslation();
  const [travelers, setTravelers] = React.useState<UserMetadata[] | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchTravelers() {
      const travelers = [...invitedIds, authorId];
      const users = await Promise.all(
        travelers.map(async (id) => {
          const user = await getUserMetadata(id, undefined, getToken);
          return {
            id: user?.id,
            firstName: user?.firstName || "Anonyme",
            lastName: user?.lastName,
            imageUrl: user?.imageUrl,
          };
        })
      );

      setTravelers(users);
    }
    fetchTravelers();
  }, [invitedIds]);

  function formatName(traveler: UserMetadata) {
    return traveler.firstName;
  }

  return travelers && travelers.length > 0 ? (
    <Link
      href={`/(modals)/travelers/${tripId}`}
      asChild
    >
      <TouchableOpacity
        style={{
          marginTop: 15,
          flexDirection: "row",
          alignItems: "center",
          gap: 0,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: -15,
          }}
        >
          {travelers?.map((traveler, index) =>
            index < 2 ? (
              <Image
                key={traveler.id}
                source={{ uri: traveler.imageUrl }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  // marginLeft: 10,
                  marginRight: 5,
                  borderColor: "#fff",
                  borderWidth: 2,
                }}
              />
            ) : null
          )}
          {travelers.length > 2 ? (
            <View
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                // marginLeft: 10,
                marginRight: 5,
                borderColor: "#fff",
                borderWidth: 2,
                backgroundColor: Colors.light.background,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.light.primary,
                  opacity: 0.8,
                  fontFamily: "Outfit_500Medium",
                }}
              >
                +{travelers.length - 2}
              </Text>
            </View>
          ) : null}
        </View>
        <Text>
          {t("with").toLowerCase()}{" "}
          {travelers?.length === 1
            ? formatName(travelers[0])
            : travelers.length === 2
            ? formatName(travelers[0]) +
              ` ${t("and").toLowerCase()} ` +
              formatName(travelers[1])
            : formatName(travelers[0]) +
              ", " +
              formatName(travelers[1]) +
              ` ${t("moreCount", { count: travelers.length - 2 })}`}
        </Text>
      </TouchableOpacity>
    </Link>
  ) : null;
}

const styles = StyleSheet.create({
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

function LocationCard({ location }: { location: string }) {
  return (
    <BlurView
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        position: "absolute",
        top: 8,
        left: 8,
        borderRadius: 5,
        padding: 5,
        paddingHorizontal: 10,
      }}
    >
      <Icon
        icon="mapPinIcon"
        size={14}
        color={Colors.dark.primary}
      />
      <Text
        style={{
          color: Colors.dark.primary,
          fontSize: 12,
          fontFamily: "Outfit_600SemiBold",
        }}
      >
        {location}
      </Text>
    </BlurView>
  );
}

// export default function TripCard({
//   trip,
//   light = false,
//   transparent = false,
// }: {
//   trip: SavedTrip;
//   light?: boolean;
//   transparent?: boolean;
// }) {
//   return trip ? (
//     <View
//       style={{
//         backgroundColor: transparent ? "transparent" : "white",
//         padding: light ? 0 : 20,
//         borderRadius: borderRadius * 2,
//       }}
//     >
//       {!light && (
//         <UserCard
//           userId={trip.author_id}
//           size="small"
//           DetailsComponent={() => (
//             <Text
//               style={{
//                 fontSize: 11,
//                 color: Colors.light.primary,
//                 opacity: 0.8,
//                 fontFamily: "Outfit_400Regular",
//               }}
//             >
//               {formatDateToRelative(trip.updated_at)}
//             </Text>
//           )}
//         />
//       )}
//       {/* {trip.author_id === user?.id && (
//         <TouchableOpacity
//           style={{
//             position: "absolute",
//             right: 20,
//             top: 20,
//             backgroundColor: Colors.light.background,
//             justifyContent: "center",
//             alignItems: "center",
//             borderRadius: 10,
//             width: 40,
//             height: 40,
//           }}
//           onPress={async () => {
//             track("Share trip clicked");
//             const result = await Share.share({
//               message: `Rejoins-moi pour mon voyage sur Favel !\n\n${trip.name}\n\n\https://app.favel.net/invite/${trip.id}`,
//             });
//           }}
//         >
//           <ShareIcon />
//         </TouchableOpacity>
//       )} */}
//       <Link
//         href={`/(auth)/trip/${trip.id}`}
//         asChild
//         style={{
//           marginTop: light ? 0 : 15,
//         }}
//       >
//         <Pressable>
//           <View
//             style={{
//               marginBottom: 20,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: light ? 16 : 20,
//                 fontFamily: "Outfit_600SemiBold",
//               }}
//             >
//               {trip.name}
//             </Text>
//             {trip.dates && trip.dates.type === "flexDates" && (
//               <Text
//                 style={{
//                   fontSize: 14,
//                   color: Colors.light.primary,
//                   opacity: 0.8,
//                   fontFamily: "Outfit_400Regular",
//                 }}
//               >
//                 {`${trip.dates.duration} jours en ${months[trip.dates.month]}`}
//               </Text>
//             )}
//           </View>
//           <View style={{ height: light ? 150 : 200 }}>
//             <View style={styles.mainContainer}>
//               <View style={{ ...styles.blockA, ...styles.thumbnail }}>
//                 <Image
//                   source={{
//                     uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[0]?.id}-700.jpg`,
//                   }}
//                   style={{ flex: 1 }}
//                 />
//               </View>
//               {trip.route && trip.route.length > 1 && (
//                 <View style={styles.rightSideContainer}>
//                   <View style={{ ...styles.thumbnail }}>
//                     <Image
//                       source={{
//                         uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[1]?.id}-700.jpg`,
//                       }}
//                       style={{ flex: 1 }}
//                     />
//                   </View>
//                   {trip.route.length > 2 && (
//                     <View style={{ ...styles.thumbnail }}>
//                       <Image
//                         source={{
//                           uri: `https://storage.googleapis.com/favel-photos/hotspots/${trip.route?.[2]?.id}-700.jpg`,
//                         }}
//                         style={{ flex: 1 }}
//                       />
//                     </View>
//                   )}
//                 </View>
//               )}
//             </View>
//           </View>
//           {/* {trip.author_id !== user?.id && (
//             <CreatedBy authorId={trip.author_id} />
//           )} */}
//           {trip.invited_ids && <WithList invitedIds={trip.invited_ids} />}
//         </Pressable>
//       </Link>
//       {!light && (
//         <View
//           style={{
//             flexDirection: "row",
//             gap: 10,
//             marginTop: 15,
//           }}
//         >
//           <LikeButton trip={trip} />
//           <ActionButton
//             icon="messageDotsIcon"
//             title={`Commenter`}
//             onPress={() => {}}
//           />
//           <ActionButton
//             IconComponent={ShareIcon}
//             title={`Partager`}
//             onPress={() => {}}
//           />
//         </View>
//       )}
//       {/* {trip.author_id === user?.id ? (
//         <TouchableOpacity
//           style={{
//             marginTop: 15,
//             width: "100%",
//             backgroundColor: Colors.light.accent,
//             justifyContent: "center",
//             alignItems: "center",
//             borderRadius: 10,
//             height: 40,
//             flexDirection: "row",
//             gap: 10,
//           }}
//           onPress={async () => {
//             track("Share trip clicked");
//             const result = await Share.share({
//               message: `Rejoins-moi pour mon voyage sur Favel !\n\n${trip.name}\n\n\https://app.favel.net/invite/${trip.id}`,
//             });
//           }}
//         >
//           <ShareIcon
//             color="white"
//             size={22}
//           />
//           <Text
//             style={{
//               color: "white",
//               fontSize: 18,
//               fontFamily: "Outfit_500Medium",
//             }}
//           >
//             Partager mon voyage
//           </Text>
//         </TouchableOpacity>
//       ) : null} */}
//     </View>
//   ) : null;
// }
