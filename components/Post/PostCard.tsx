import { View, TouchableOpacity, Share } from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { borderRadius, padding } from "@/constants/values";
import { Post, SavedTrip, UserMetadata } from "@/types/types";
import { formatDateToRelative, getUserMetadata } from "@/lib/utils";
import { Image } from "expo-image";
import TripCard from "../TripCard";
import Icon, { IconProps } from "../Icon";
import Header from "./Header";
import ActionButton from "./actions/ActionButton";
import ShareIcon from "../ShareIcon";
import LikeButton from "./actions/LikeButton";
import { MMKV } from "@/app/_layout";
import { Text } from "../Themed";
import CommentButton from "./actions/CommentButton";
import { track } from "@amplitude/analytics-react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function PostCard({
  post,
  style,
  noLink = false,
  noHeader = false,
  followButton = false,
}: {
  post: Post;
  style?: any;
  noLink?: boolean;
  noHeader?: boolean;
  followButton?: boolean;
}) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const { getToken } = useAuth();

  async function getUser() {
    if (!post.author_id) return;
    try {
      const cachedUser = await MMKV.getStringAsync(`user-${post.author_id}`);
      const cachedUserParsed = JSON.parse(cachedUser || "{}");
      console.log("cachedUserParsed", cachedUserParsed);
      if (cachedUserParsed && cachedUserParsed.data) {
        setUserMetadata(cachedUserParsed.data);
      }
    } catch (error) {
      console.log("error", error);
    }
    const data = await getUserMetadata(post.author_id, undefined, getToken);
    console.log("userMetadata", data);

    setUserMetadata(data);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    MMKV.setString(`post-${post.id}`, JSON.stringify(post));
  }, [post]);

  return (
    <View
      style={[
        {
          backgroundColor: Colors.light.secondary,
          padding: padding,
          // borderRadius: borderRadius * 2,
        },
        style,
      ]}
    >
      {!noHeader && (
        <Header
          userMetadata={userMetadata}
          post={post}
          followButton={followButton}
        />
      )}
      {post.original_post ? (
        <View
          style={{
            width: "100%",
            height: 2,
            backgroundColor: Colors.light.background,
            marginBottom: 10,
            borderRadius: 5,
          }}
        />
      ) : null}
      {post.text ? (
        <View>
          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: Colors.light.primary,
            }}
          >
            {post.text}
          </Text>
        </View>
      ) : null}
      {post.type === "trip" && post.trip_id ? (
        <TripCard
          tripId={post.trip_id}
          postId={post.id}
        />
      ) : null}
      {post.original_post ? (
        <PostCard
          post={post.original_post}
          style={{ padding: 0 }}
          noHeader={post.original_post.type === "trip" ? true : false}
        />
      ) : (
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 15,
          }}
        >
          <LikeButton post={post} />
          <CommentButton
            post={post}
            noLink={noLink}
          />

          <ActionButton
            IconComponent={ShareIcon}
            title={`Partager`}
            onPress={async () => {
              track("Post shared", {
                postId: post.id,
              });
              try {
                const result = await Share.share({
                  message: `Regarde cette publication sur Favel !\n\n\nhttps://app.favel.net/link?path=post/${post.id}`,
                });
              } catch (error) {
                alert(error);
              }
            }}
          />
        </View>
      )}
    </View>
  );
}
