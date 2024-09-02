import { Post, UserMetadata } from "@/types/types";
import { Image } from "expo-image";
import { View } from "react-native";
import { Text } from "../Themed";
import Colors from "@/constants/Colors";
import { formatDateToRelative } from "@/lib/utils";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Link } from "expo-router";
import FollowButton from "../FollowButton";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";

function findActionText(
  action: Post["action"],
  action_data: Post["action_data"],
  t: TFunction<"translation", undefined>
) {
  switch (action) {
    case "join_trip":
      return t("postHeader.joinedTrip");
    case "edit_trip":
      if (action_data.editsCount > 1) {
        return t("postHeader.editedTripMultiple", {
          count: action_data.editsCount,
        });
      } else {
        return t("postHeader.editedTrip");
      }
    default:
      return "";
  }
}

export default function Header({
  userMetadata,
  post,
  followButton = false,
}: {
  userMetadata: UserMetadata | null;
  post: Post;
  followButton?: boolean;
}) {
  const { user } = useUser();
  const { t } = useTranslation();

  return (
    <View
      style={{
        marginBottom: 20,
      }}
    >
      {userMetadata ? (
        <View>
          <Link
            href={
              post.original_post
                ? `/post/${post.original_post.id}`
                : // : `/(auth)/profile/(tabs)`
                  `/profile/${post.author_id}`
            }
            asChild
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
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
                  {post.action ? (
                    <Text style={{ fontFamily: "Outfit_400Regular" }}>
                      {findActionText(post.action, post.action_data, t)}
                    </Text>
                  ) : null}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: Colors.light.primary,
                    opacity: 0.8,
                    fontFamily: "Outfit_400Regular",
                    marginTop: 2,
                  }}
                >
                  {formatDateToRelative(post.updated_at)}
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
          <View
            style={{
              position: "absolute",
              right: 0,
              top: 0,
            }}
          >
            {followButton && userMetadata.id !== user?.id ? (
              <FollowButton profileId={userMetadata.id} />
            ) : null}
          </View>
        </View>
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
  );
}
