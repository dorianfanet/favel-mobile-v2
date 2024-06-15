import { View } from "react-native";
import React, { useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import { borderRadius, padding } from "@/constants/values";
import { PostComment, UserMetadata } from "@/types/types";
import {
  formatDateToRelative,
  formatDateToRelativeShort,
  getUserMetadata,
} from "@/lib/utils";
import { Image } from "expo-image";
import { Text } from "./Themed";
import { useAuth } from "@clerk/clerk-expo";

export default function Comment({ comment }: { comment: PostComment }) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);

  const { getToken } = useAuth();

  async function getUser() {
    if (!comment.author_id) return;
    const data = await getUserMetadata(comment.author_id, false, getToken);

    setUserMetadata(data);
  }

  useEffect(() => {
    getUser();
  }, [comment]);

  return (
    <View
      style={[
        {
          backgroundColor: Colors.light.secondary,
          padding: padding,
          borderRadius: borderRadius * 2,
          flexDirection: "row",
          gap: 10,
        },
      ]}
    >
      {userMetadata ? (
        <>
          <View
            style={{
              width: 40,
              justifyContent: "flex-start",
            }}
          >
            <Image
              source={{ uri: userMetadata.imageUrl }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />
          </View>
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {userMetadata.firstName} {userMetadata.lastName}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Outfit_400Regular",
                  opacity: 0.8,
                }}
              >
                {" • "}
                {formatDateToRelativeShort(comment.created_at)}
              </Text>
            </View>

            <Text>{comment.content}</Text>
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              justifyContent: "flex-start",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.light.background,
              }}
            />
          </View>
          <View>
            <View
              style={{
                width: 80,
                height: 20,
                borderRadius: 5,
                backgroundColor: Colors.light.background,
              }}
            />
            <View
              style={{
                width: 200,
                height: 18,
                borderRadius: 5,
                backgroundColor: Colors.light.background,
              }}
            />
          </View>
        </>
      )}
    </View>
  );
}
