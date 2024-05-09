import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import ContainedButton from "./ContainedButton";
import Icon from "./Icon";
import Colors from "@/constants/Colors";
import { track } from "@amplitude/analytics-react-native";
import { createTripInvite } from "@/lib/utils";
import { useUser } from "@clerk/clerk-expo";

export default function InviteButton({ tripId }: { tripId: string }) {
  const { user } = useUser();
  const [loading, setLoading] = React.useState(false);

  return user && user.id ? (
    <ContainedButton
      TitleComponent={
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Icon
              icon={"userPlusIcon"}
              size={18}
              color={Colors.dark.primary}
            />
          )}
          <Text
            style={{
              color: "white",
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            {loading ? "Chargement..." : "Inviter des voyageurs"}
          </Text>
        </View>
      }
      onPress={async () => {
        setLoading(true);
        track("Invite to trip clicked");
        const { error } = await createTripInvite(user.id, tripId);
        if (error) {
          alert("Une erreur est survenue, veuillez réessayer");
          track("Invite to trip error", { error });
          setLoading(false);
          return;
        }
        setLoading(false);
      }}
      type="ghost"
    />
  ) : null;
}
