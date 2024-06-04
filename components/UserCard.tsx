import { getUserMetadata } from "@/lib/utils";
import { UserMetadata } from "@/types/types";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Link, useRouter } from "expo-router";
import FollowButton from "./FollowButton";
import { MMKV } from "@/app/_layout";

const sizes = {
  extraSmall: {
    image: 20,
    gap: 10,
    text: 12,
  },
  small: {
    image: 30,
    gap: 10,
    text: 14,
  },
  default: {
    image: 50,
    gap: 10,
    text: 16,
  },
};

export default function UserCard({
  userId,
  theme = "light",
  DetailsComponent,
  size = "default",
  avatarOnly = false,
  youIndicator,
  followButton,
  style,
  noLink,
  onPress,
}: {
  userId: string | undefined;
  theme?: "light" | "dark";
  DetailsComponent?: React.ComponentType;
  size?: "extraSmall" | "small" | "default";
  avatarOnly?: boolean;
  youIndicator?: boolean;
  followButton?: boolean;
  style?: any;
  noLink?: boolean;
  onPress?: (user: UserMetadata) => void;
}) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const { getToken } = useAuth();

  useEffect(() => {
    async function getUser() {
      if (!userId) return;
      try {
        const cachedUser = await MMKV.getStringAsync(`user-${userId}`);
        const cachedUserParsed = JSON.parse(cachedUser || "{}");
        if (cachedUserParsed && cachedUserParsed.data) {
          setUserMetadata(cachedUserParsed.data);
        }
      } catch (error) {
        console.log("error", error);
      }
      const data = await getUserMetadata(userId, undefined, getToken);

      setUserMetadata(data);
    }
    getUser();
  }, []);

  return userMetadata ? (
    // <Link
    //   href={`/profile/${userId}`}
    //   asChild
    // >
    <TouchableOpacity
      style={[
        {
          flexDirection: "row",
          justifyContent: "flex-start",
          alignItems: "center",
        },
        style,
      ]}
      onPress={() => {
        if (noLink) return;
        if (onPress) {
          onPress(userMetadata);
          return;
        }
        try {
          router.dismiss();
        } catch (e) {}
        router.push(`/profile/${userId}`);
      }}
    >
      <Image
        source={{ uri: userMetadata.imageUrl }}
        style={{
          width: sizes[size].image,
          height: sizes[size].image,
          borderRadius: 25,
          // marginLeft: 10,
          marginRight: sizes[size].gap,
        }}
      />
      {!avatarOnly && (
        <Text
          style={{
            fontSize: sizes[size].text,
            fontFamily: "Outfit_600SemiBold",
            color: Colors[theme].primary,
          }}
        >
          {userMetadata.firstName} {userMetadata.lastName}{" "}
          {/* {youIndicator && userMetadata.id === user?.id ? "(vous)" : ""} */}
        </Text>
      )}
      {/* <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignContent: "center",
        }}
      >
        <View
          style={{
            justifyContent: "center",
            backgroundColor: "green",
            flex: 1,
          }}
        >
          <Text
            style={{
              fontSize: sizes[size].text,
              fontFamily: "Outfit_600SemiBold",
              color: Colors[theme].primary,
            }}
          >
            {userMetadata.firstName} {userMetadata.lastName}{" "}
          </Text>
          {DetailsComponent && <DetailsComponent />}
        </View>
        {followButton && userMetadata.id && userMetadata.id !== user?.id && (
          <FollowButton profileId={userMetadata.id} />
        )}
      </View> */}
    </TouchableOpacity>
  ) : // </Link>
  null;
}
