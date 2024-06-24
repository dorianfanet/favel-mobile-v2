import React, { useCallback, useEffect, useState } from "react";
import { Notification as NotificationType, UserMetadata } from "@/types/types";
import { Text } from "./Themed";
import { borderRadius } from "@/constants/values";
import Icon, { IconProps } from "./Icon";
import {
  formatDateToRelative,
  getTripMetadataFromCache,
  getUserMetadata,
} from "@/lib/utils";
import { Image } from "expo-image";
import Colors from "@/constants/Colors";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { MMKV } from "@/app/_layout";

const colors = {
  like: "#f00",
  follow: Colors.light.accent,
  comment: Colors.light.primary,
  join_trip: "#44d747",
};

const icons: { [key: string]: IconProps["icon"] } = {
  like: "likeIcon",
  follow: "userPlusIcon",
  comment: "messageDotsSquareIcon",
  join_trip: "usersPlusIcon",
  message: "messageDotsIcon",
};

const text: { [key: string]: string } = {
  like: "a aimé votre voyage",
  follow: "vous suit désormais !",
  comment: "a commenté votre voyage",
  join_trip: "a rejoint votre voyage",
  message: "sur",
};

export default function Notification({
  notification,
}: {
  notification: NotificationType;
}) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const router = useRouter();

  const { getToken } = useAuth();

  async function getUser() {
    if (!notification.author_id) return;
    const data = await getUserMetadata(
      notification.author_id,
      undefined,
      getToken
    );

    setUserMetadata(data);
  }

  useEffect(() => {
    getUser();
  }, []);

  const tripName = useCallback(() => {
    console.log("Notification ", notification);
    if (notification.data) {
      if (notification.data.tripId) {
        const trip = getTripMetadataFromCache(notification.data.tripId);
        if (trip) {
          return trip.name;
        } else {
          return "";
        }
      } else if (notification.data.conversationId) {
        const conversation = MMKV.getString(
          `conversation-${notification.data.conversationId}`
        );
        console.log("Conversation cahce", conversation);
        if (conversation) {
          const json = JSON.parse(conversation);
          return json.name;
        } else {
          return "";
        }
      }
    } else {
      return "";
    }
  }, [notification]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {!notification.is_read && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: Colors.light.accent,
            marginRight: 10,
          }}
        />
      )}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: borderRadius,
          padding: 10,
          flex: 1,
        }}
      >
        {userMetadata ? (
          <TouchableOpacity
            onPress={() => {
              if (notification.data && notification.data.link) {
                router.navigate(notification.data.link);
              }
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {notification.type ? (
                <Icon
                  icon={icons[notification.type]}
                  color={colors[notification.type]}
                  size={20}
                  style={{
                    marginRight: 10,
                  }}
                />
              ) : null}
              <View>
                <Image
                  source={{ uri: userMetadata.imageUrl }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 25,
                    // marginLeft: 10,
                    marginRight: 10,
                  }}
                />

                {/* {notification.type ? (
    
                  <Icon
                    icon={icons[notification.type]}
                    color={colors[notification.type]}
                    size={20}
                    style={{
                      position: "absolute",
                      bottom: -3,
                      right: 7,
                    }}
                  />
              ) : null} */}
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  {userMetadata.firstName} {userMetadata.lastName}{" "}
                  <Text style={{ fontFamily: "Outfit_400Regular" }}>
                    {notification.type ? text[notification.type] : ""}
                  </Text>{" "}
                  {notification.data &&
                  (notification.data.tripId || notification.data.conversationId)
                    ? tripName()
                    : null}
                </Text>
                {notification.data && notification.data.message ? (
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.light.primary,
                      fontFamily: "Outfit_400Regular",
                    }}
                    numberOfLines={4}
                    ellipsizeMode="tail"
                  >
                    {notification.data.message}
                  </Text>
                ) : null}
                <Text
                  style={{
                    fontSize: 11,
                    color: Colors.light.primary,
                    opacity: 0.8,
                    fontFamily: "Outfit_400Regular",
                    marginTop: 5,
                  }}
                >
                  {formatDateToRelative(notification.created_at)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 25,
                backgroundColor: Colors.light.background,
                marginRight: 10,
              }}
            />
            <View
              style={{
                width: 100,
                height: 16,
                borderRadius: 5,
                backgroundColor: Colors.light.background,
                marginBottom: 5,
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
