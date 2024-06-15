import { ActivityIndicator, View } from "react-native";
import React, { useEffect } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { favelClient } from "@/lib/favelApi";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Identify, identify, track } from "@amplitude/analytics-react-native";
import ContainedButton from "@/components/ContainedButton";

export default function Index() {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();

  const [error, setError] = React.useState<string | null>(null);

  const { getToken } = useAuth();

  useEffect(() => {
    handleInvite();
  }, [id]);

  async function handleInvite() {
    if (!id || !user) return;
    setError(null);
    const justJoined =
      user.createdAt &&
      new Date(user.createdAt).getTime() > Date.now() - 5 * 60 * 1000;
    track("Invitation page viewed", { id: id, justJoined });

    const identifyObj = new Identify();
    identifyObj.set("joinedFromTripInvite", "true");
    identify(identifyObj);

    favelClient(getToken).then((favel) =>
      favel
        .inviteUser(id as string, user.id, user.firstName || "Inconnu")
        .then((res) => {
          console.log(res);
          if (res.id) {
            router.replace(`/trip/${res.id}`);
          } else {
            setError("Erreur lors de l'invitation. Veuillez réessayer.");
          }
        })
    );
  }

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
        <>
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            {error}
          </Text>
          <ContainedButton
            title="Réessayer"
            onPress={handleInvite}
            type="ghost"
            style={{ marginTop: 20 }}
          />
        </>
      ) : (
        <ActivityIndicator
          size="large"
          color={"white"}
        />
      )}
    </View>
  );
}
