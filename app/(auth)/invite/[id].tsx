import { ActivityIndicator, View } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { favel } from "@/lib/favelApi";
import { useUser } from "@clerk/clerk-expo";
import { track } from "@amplitude/analytics-react-native";

export default function Index() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    track("Invitation page viewed", { id: id });

    favel.inviteUser(id as string, user.id).then((res) => {
      if (res.message === "User invited") {
        router.navigate(`/trip/${id}`);
      } else {
        setError("Erreur lors de l'invitation");
      }
    });
  }, [id]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.light.accent,
      }}
    >
      <Stack.Screen
        options={{
          title: "Inviter",
          headerShown: false,
        }}
      />
      {error ? (
        <Text>{error}</Text>
      ) : (
        <ActivityIndicator
          size="large"
          color={"white"}
        />
      )}
    </View>
  );
}
