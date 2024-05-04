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
import { MMKV } from "@/app/(auth)/trip/_layout";
import { Text } from "../Themed";
import CommentButton from "./actions/CommentButton";
import { track } from "@amplitude/analytics-react-native";

export default function PostCard({
  post,
  style,
  noLink = false,
  noHeader = false,
}: {
  post: Post;
  style?: any;
  noLink?: boolean;
  noHeader?: boolean;
}) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);

  async function getUser() {
    if (!post.author_id) return;
    const data = await getUserMetadata(post.author_id);
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
          {post.type === "trip" && post.trip_id ? (
            <ActionButton
              IconComponent={ShareIcon}
              title={`Partager`}
              onPress={async () => {
                track("Share trip clicked");
                try {
                  const result = await Share.share({
                    message: `Rejoins-moi pour mon voyage sur Favel !\n\n\nhttps://app.favel.net/invite/${post.trip_id}`,
                  });
                } catch (error) {
                  alert(error);
                }
              }}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}
