import { View } from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { Text } from "@/components/Themed";
import Profile from "../../profile/Profile";

export default function Index() {
  const { user } = useUser();

  return user ? (
    <Profile userId={user.id} />
  ) : (
    <View>
      <Text>Une erreur s'est produite</Text>
    </View>
  );
}
