import {
  TextInput,
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  FlatList,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Text, View as ThemedView, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { borderRadius, padding } from "@/constants/values";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { favel } from "@/lib/favelApi";
import { months } from "@/constants/data";
import { track } from "@amplitude/analytics-react-native";
import { Post, SavedTrip, UserMetadata } from "@/types/types";
import { supabase } from "@/lib/supabase";
import TripCard from "@/components/TripCard";
import FollowButton from "@/components/FollowButton";
import { getUserMetadata, getUserMetadataFromCache } from "@/lib/utils";
import Icon from "@/components/Icon";
import { MMKV } from "../trip/_layout";
import PostCard from "@/components/Post/PostCard";

export default function Profile({ userId }: { userId: string }) {
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const [posts, setPosts] = React.useState<{ post_json: Post }[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshProfile, setRefreshProfile] = useState<number>(0);

  async function fetchFollowedUserPosts() {
    const { data, error } = await supabase.rpc("get_posts_of_user", {
      user_id: userId,
    });

    if (error) {
      console.error("Error:", error);
      setLoading(false);
    } else {
      console.log("Data:", data);
      setPosts(data);
      setLoading(false);
    }

    return data;
  }

  useEffect(() => {
    fetchFollowedUserPosts();
  }, []);

  console.log(JSON.stringify(posts));

  return loading ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.background,
      }}
    >
      <ActivityIndicator
        animating
        size="large"
      />
    </View>
  ) : (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.post_json.id}
      renderItem={({ item }) => (
        <View>
          <PostCard post={item.post_json} />
        </View>
      )}
      style={{
        backgroundColor: Colors.light.background,
      }}
      contentContainerStyle={{
        rowGap: 10,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchFollowedUserPosts();
            setRefreshProfile(refreshProfile + 1);
            setRefreshing(false);
          }}
          colors={[Colors.light.primary]}
          tintColor={Colors.light.primary}
        />
      }
      ListHeaderComponent={
        <ProfileComponent
          profileId={userId}
          refreshProfile={refreshProfile}
        />
      }
    />
  );

  // const [trips, setTrips] = React.useState<SavedTrip[] | []>([]);

  // const [refreshing, setRefreshing] = React.useState(false);
  // const page = useRef(0);
  // const [scrollLoading, setScrollLoading] = React.useState<
  //   "loading" | "last" | null
  // >(null);

  // const [refreshProfile, setRefreshProfile] = useState<number>(0);

  // useEffect(() => {
  //   track("Profile page viewed");
  //   onRefresh();
  // }, []);

  // const onRefresh = React.useCallback(async () => {
  //   // const newTrips = await getTrips(0);
  //   // page.current = 0;
  //   // if (newTrips) {
  //   //   setTrips(newTrips);
  //   // }
  //   // await updateProfileMetadata();
  //   setRefreshing(false);
  // }, []);

  // // async function getTrips(currentPage: number) {
  // //   if (!user) return;
  // //   console.log("page", page.current);
  // //   const { data: trips, error } = await supabase
  // //     .from("trips_v2")
  // //     .select("id, name, route, dates, author_id, updated_at, invited_ids")
  // //     // .or(`author_id.eq.${user?.id}`)
  // //     .or(`author_id.eq.${user?.id},invited_ids.cs.{${user!.id}}`)
  // //     .like("status", "trip%")
  // //     .order("updated_at", { ascending: false })
  // //     .range(currentPage * 5, currentPage * 5 + 4);

  // //   if (error) {
  // //     Alert.alert("Error", error.message);
  // //     console.log(error);
  // //   } else return trips;
  // // }

  // async function addTrips() {
  //   // const newTrips = await getTrips(page.current + 1);
  //   // if (newTrips) {
  //   //   setTrips([...trips, ...newTrips]);
  //   //   page.current += 1;
  //   // }
  // }

  // // async function updateProfileMetadata() {
  // //   const { data, error } = await supabase
  // //     .from("trips_v2")
  // //     .select("author_id, invited_ids")
  // //     .or(`author_id.eq.${userId},invited_ids.cs.{${userId}}`)
  // //     .like("status", "trip%");

  // //   if (error) {
  // //     console.error(error);
  // //     setRefreshing(false);
  // //     return;
  // //   }

  // //   if (data) {
  // //     let travelers = data.map((trip: any) => {
  // //       let temp = [];
  // //       if (trip.author_id) temp.push(trip.author_id);
  // //       if (trip.invited_ids) temp.push(...trip.invited_ids);
  // //       return temp;
  // //     });

  // //     const userMetadata = await favel.getUser(userId);

  // //     if (
  // //       userMetadata &&
  // //       userMetadata.publicMetadata &&
  // //       userMetadata.publicMetadata.coTravelers
  // //     ) {
  // //       travelers.push(userMetadata.publicMetadata.coTravelers);
  // //     }

  // //     const coTravelers = Array.from(
  // //       new Set(travelers.flat().filter((id: string) => id !== userId))
  // //     );

  // //     console.log("trips", data.length);
  // //     console.log("coTravelersCountr", coTravelers.length);
  // //     console.log("coTravelers", coTravelers);

  // //     await favel.updateUser(userId, {
  // //       publicMetadata: {
  // //         trips: data.length,
  // //         coTravelers: coTravelers,
  // //       },
  // //     });
  // //   }
  // // }

  // return (
  //   <>
  //     <FlatList
  //       refreshControl={
  //         <RefreshControl
  //           refreshing={refreshing}
  //           onRefresh={() => {
  //             setRefreshing(true);
  //             setRefreshProfile(refreshProfile + 1);
  //             onRefresh();
  //           }}
  //           colors={[Colors.light.primary]}
  //           tintColor={Colors.light.primary}
  //         />
  //       }
  //       contentContainerStyle={{
  //         rowGap: 10,
  //         paddingBottom: 60,
  //       }}
  //       style={{
  //         padding: 0,
  //         backgroundColor: Colors.light.background,
  //       }}
  //       data={trips}
  //       keyExtractor={(item) => item.id}
  //       renderItem={({ item }) => (
  //         <View
  //           style={{
  //             paddingHorizontal: padding,
  //           }}
  //         >
  //           {/* <TripCard
  //             key={item.id}
  //             trip={item}
  //           /> */}
  //         </View>
  //       )}
  //       onEndReached={() => {
  //         setScrollLoading("loading");
  //         addTrips();
  //         setScrollLoading(null);
  //       }}
  //       ListFooterComponent={
  //         <View style={{ marginTop: 10 }}>
  //           {scrollLoading === "loading" && (
  //             <ActivityIndicator
  //               animating
  //               size="large"
  //             />
  //           )}
  //           <Text
  //             style={{
  //               textAlign: "center",
  //             }}
  //           >
  //             {/* {!scrollLoading &&
  //                 "Descendez encore pour charger d'autres voyages"} */}
  //             {scrollLoading === "last" &&
  //               "Il n'y a plus de voyages à afficher"}
  //           </Text>
  //         </View>
  //       }
  // ListHeaderComponent={
  //   <ProfileComponent
  //     profileId={userId}
  //     refreshProfile={refreshProfile}
  //   />
  // }
  //     />
  //   </>
  // );
}

function ProfileComponent({
  profileId,
  refreshProfile,
}: {
  profileId: string | null;
  refreshProfile?: number;
}) {
  const [user, setUser] = useState<UserMetadata | null>(null);
  const { user: authUser } = useUser();
  const [followers, setFollowers] = useState<number | null>(null);
  const [following, setFollowing] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const cache = JSON.parse(MMKV.getString(`user-${profileId}`) || "null");
    if (cache && "data" in cache) setUser(cache.data);
  }, []);

  const getAndSetFollowers = useCallback(async (profileId: string) => {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", profileId);

    if (error) {
      console.error(error);
      return;
    }

    const followersCount = count || 0;
    setFollowers(followersCount);
    MMKV.setString(`followers_count-${profileId}`, followersCount.toString());
  }, []);

  const getAndSetFollowing = useCallback(async (profileId: string) => {
    const { count, error } = await supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", profileId);

    if (error) {
      console.error(error);
      return;
    }

    const followingCount = count || 0;
    setFollowing(followingCount);
    MMKV.setString(`following_count-${profileId}`, followingCount.toString());
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const getUser = async () => {
      const data = await getUserMetadata(profileId);
      setUser(data);
    };

    getUser();

    const cachedFollowers = MMKV.getString(`followers_count-${profileId}`);
    setFollowers(parseInt(cachedFollowers));
    getAndSetFollowers(profileId);

    const cachedFollowing = MMKV.getString(`following_count-${profileId}`);
    setFollowing(parseInt(cachedFollowing));
    getAndSetFollowing(profileId);
  }, [profileId, refreshProfile, getAndSetFollowers, getAndSetFollowing]);

  console.log(user);

  return user ? (
    <View
      style={{
        backgroundColor: Colors.light.secondary,
        padding: padding,
        marginBottom: padding - 10,
        paddingVertical: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 20,
        }}
      >
        <Image
          source={{ uri: user.imageUrl }}
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
        <View
          style={{
            backgroundColor: "transparent",
            justifyContent: "space-between",
          }}
        >
          <View />
          <View>
            <Text style={{ fontSize: 18, fontFamily: "Outfit_600SemiBold" }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ fontSize: 14, opacity: 0.8 }}>
              {user.createdAt
                ? `A rejoint Favel en ${
                    months[new Date(user.createdAt).getMonth()]
                  } ${new Date(user.createdAt).getFullYear()}`
                : ""}
            </Text>
          </View>
          <View
            style={{
              alignSelf: "flex-start",
            }}
          >
            {authUser && authUser.id !== user.id ? (
              <FollowButton
                profileId={user.id}
                onPress={(value: "1" | "0") => {
                  if (value === "1") {
                    setFollowers((followers || 0) + 1);
                  } else {
                    setFollowers((followers || 0) - 1);
                  }
                }}
              />
            ) : (
              <Link
                asChild
                href="/(modals)/editProfile"
              >
                <TouchableOpacity
                  style={{
                    padding: 3,
                    paddingHorizontal: 10,
                    backgroundColor: "#44c1e714",
                    borderRadius: borderRadius,
                    borderColor: Colors.light.accent,
                    borderWidth: 2,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    icon={"penIcon"}
                    color={Colors.light.accent}
                    size={18}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={{
                      color: Colors.light.accent,
                      fontFamily: "Outfit_600SemiBold",
                      fontSize: 16,
                      textAlign: "center",
                    }}
                  >
                    Modifier le profil
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <Count
          count={
            user?.publicMetadata && user.publicMetadata.trips
              ? (user.publicMetadata.trips as number)
              : 0
          }
          title={"Voyages"}
          onPress={() => router.navigate("/(auth)/(tabs)/home")}
        />
        <Count
          count={followers || 0}
          title={"Abonnés"}
          onPress={() =>
            router.navigate(`/(modals)/follows/followers/${user.id}`)
          }
        />
        <Count
          count={following || 0}
          title={"Abonnements"}
          onPress={() =>
            router.navigate(`/(modals)/follows/following/${user.id}`)
          }
        />
      </View>
    </View>
  ) : (
    <View
      style={{
        backgroundColor: Colors.light.secondary,
        padding: padding,
        marginBottom: padding - 10,
      }}
    >
      <ActivityIndicator
        animating
        size="large"
      />
    </View>
  );
}

function Count({
  count,
  title,
  onPress,
}: {
  count: number;
  title: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
      }}
      onPress={onPress}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 18, fontFamily: "Outfit_600SemiBold" }}>
          {count}
        </Text>
        <Text style={{ fontSize: 14, opacity: 0.8 }}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
