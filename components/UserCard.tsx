import { getUserMetadata } from "@/lib/utils";
import { UserMetadata } from "@/types/types";
import { useUser } from "@clerk/clerk-expo";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Text } from "./Themed";
import Colors from "@/constants/Colors";

export default function UserCard({
  userId,
  theme = "light",
  DetailsComponent,
}: {
  userId: string | undefined;
  theme?: "light" | "dark";
  DetailsComponent?: React.ComponentType;
}) {
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null);
  const { user } = useUser();

  useEffect(() => {
    async function getUser() {
      if (!userId) return;
      const data = await getUserMetadata(userId);

      setUserMetadata(data);
    }
    getUser();
  }, []);

  return userMetadata ? (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
      }}
    >
      <Image
        source={{ uri: userMetadata.imageUrl }}
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          // marginLeft: 10,
          marginRight: 15,
        }}
      />
      <View>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Outfit_600SemiBold",
            color: Colors[theme].primary,
          }}
        >
          {userMetadata.firstName} {userMetadata.lastName}{" "}
          {userMetadata.id === user?.id ? "(vous)" : ""}
        </Text>
        {DetailsComponent && <DetailsComponent />}
      </View>
    </View>
  ) : null;
}
