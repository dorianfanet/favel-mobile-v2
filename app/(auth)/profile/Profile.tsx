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
  Platform,
  Share,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Text, View as ThemedView, Button } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { borderRadius, padding } from "@/constants/values";
import { Link, useRouter } from "expo-router";
import { months } from "@/constants/data";
import { Post, SavedTrip, UserMetadata } from "@/types/types";
import FollowButton from "@/components/FollowButton";
import { getUserMetadata, getUserMetadataFromCache } from "@/lib/utils";
import Icon from "@/components/Icon";
import { MMKV } from "@/app/_layout";
import PostCard from "@/components/Post/PostCard";
import ContainedButton from "@/components/ContainedButton";
import { supabaseClient } from "@/lib/supabaseClient";
import { track } from "@amplitude/analytics-react-native";

export default function Profile({ userId }: { userId: string }) {
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const [posts, setPosts] = React.useState<{ post_json: Post }[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshProfile, setRefreshProfile] = useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(0);
  const [scrollLoading, setScrollLoading] = React.useState<
    "loading" | "last" | null
  >(null);
  const isPostEndReached = React.useRef(false);

  const { getToken } = useAuth();

  async function fetchFollowedUserPosts() {
    return await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.rpc("get_posts_of_user", {
        user_id: userId,
        page_number: 0,
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
    });
  }

  useEffect(() => {
    fetchFollowedUserPosts();
  }, []);

  async function handleEndReached() {
    if (!userId) return;
    if (isPostEndReached.current) return;
    setScrollLoading("loading");
    return await supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.rpc("get_posts_of_user", {
        user_id: userId,
        page_number: page + 1,
      });

      if (error) {
        console.error("Error:", error);
        setScrollLoading(null);
        setError("Une erreur est survenue.");
      } else if (data.length === 0) {
        setScrollLoading("last");
        setError(null);
        isPostEndReached.current = true;
      } else {
        console.log("Data:", data);
        setPosts([...posts!, ...data]);
        setScrollLoading(null);
        setError(null);
        setPage(page + 1);
      }

      return data;
    });
  }

  return loading ? (
    <>
      <ProfileComponent
        profileId={userId}
        refreshProfile={refreshProfile}
      />
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
    </>
  ) : posts && posts.length > 0 ? (
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
      onEndReached={handleEndReached}
      ListFooterComponent={
        <View style={{ height: 60, justifyContent: "center" }}>
          {scrollLoading === "loading" && (
            <ActivityIndicator
              animating
              size="small"
            />
          )}
          {scrollLoading === "last" && (
            <Text
              style={{
                textAlign: "center",
              }}
            >
              Aucune autre publication à afficher
            </Text>
          )}
        </View>
      }
    />
  ) : (
    <>
      <ProfileComponent profileId={userId} />
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.light.background,
        }}
      >
        {error ? (
          <>
            <Text
              style={{
                fontSize: 18,
                color: Colors.light.primary,
                fontFamily: "Outfit_600SemiBold",
                marginBottom: 20,
              }}
            >
              Une erreur est survenue.
            </Text>
            <ContainedButton
              title="Rafrachir"
              onPress={async () => {
                setRefreshing(true);
                await fetchFollowedUserPosts();
                setRefreshing(false);
              }}
            />
          </>
        ) : null}
      </View>
    </>
  );
}

function ProfileComponent({
  profileId,
  refreshProfile,
}: {
  profileId: string | null;
  refreshProfile?: number;
}) {
  const [user, setUser] = useState<UserMetadata | null>(
    JSON.parse(MMKV.getString(`profile-${profileId}`) || "{}").user || null
  );
  const { user: authUser } = useUser();
  const [followers, setFollowers] = useState<number | null>(
    JSON.parse(MMKV.getString(`profile-${profileId}`) || "{}").followers || null
  );
  const [following, setFollowing] = useState<number | null>(
    JSON.parse(MMKV.getString(`profile-${profileId}`) || "{}").following || null
  );

  const router = useRouter();

  const { getToken } = useAuth();

  const getAndSetFollowers = useCallback((profileId: string) => {
    supabaseClient(getToken).then(async (supabase) => {
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
    });
  }, []);

  const getAndSetFollowing = useCallback((profileId: string) => {
    supabaseClient(getToken).then(async (supabase) => {
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
    });
  }, []);

  useEffect(() => {
    if (!profileId) return;

    const getUser = async () => {
      const data = await getUserMetadata(profileId, undefined, getToken);
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

  useEffect(() => {
    if (!profileId) return;
    MMKV.setString(
      `profile-${profileId}`,
      JSON.stringify({
        user: user,
        followers: followers,
        following: following,
      })
    );
  }, [user, followers, following]);

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
              flexDirection: "row",
              gap: 5,
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
                    Modifier
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
            <TouchableOpacity
              style={{
                padding: 3,
                paddingHorizontal: 10,
                backgroundColor: Colors.light.accent,
                borderRadius: borderRadius,
                borderColor: Colors.light.accent,
                borderWidth: 2,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={async () => {
                track("Share trip clicked");
                try {
                  await Share.share({
                    message: `${user.firstName}${
                      user.lastName ? " " + user.lastName : ""
                    } sur Favel\n\n\nhttps://app.favel.net/link?path=profile/${
                      user.id
                    }`,
                  });
                } catch (error) {
                  alert(error);
                }
              }}
            >
              <Icon
                icon={Platform.OS === "ios" ? "shareIOSIcon" : "shareIcon"}
                color="white"
                size={18}
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  color: "white",
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                Partager
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          height: 50,
        }}
      >
        {/* <Count
          count={
            user?.publicMetadata && user.publicMetadata.trips
              ? (user.publicMetadata.trips as number)
              : 0
          }
          title={"Voyages"}
          onPress={() => router.navigate("/(auth)/(tabs)/home")}
        /> */}
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
          justifyContent: "center",
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
