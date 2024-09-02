import { View, Platform, Share } from "react-native";
import React from "react";
import Colors from "@/constants/Colors";
import ContainedButton from "@/components/ContainedButton";
import Icon from "@/components/Icon";
import { track } from "@amplitude/analytics-react-native";
import { useTrip } from "@/context/tripContext";
import { Text } from "@/components/Themed";
import { useTripUserRole } from "@/context/tripUserRoleContext";
import InviteButton from "@/components/InviteButton";
import { useUser } from "@clerk/clerk-expo";
import { useTranslation } from "react-i18next";

export default function ShareCTA() {
  const { tripMetadata } = useTrip();
  const { tripUserRole } = useTripUserRole();
  const { user } = useUser();
  const { t } = useTranslation();

  return (
    <>
      <Text
        style={{
          color: Colors.light.primary,
          fontSize: 24,
          fontFamily: "Outfit_700Bold",
          textAlign: "center",
        }}
      >
        {tripUserRole && tripUserRole.role !== "read-only"
          ? t("share.shareCTA")
          : t("share.inviteCTA")}
      </Text>

      <View
        style={{
          gap: 20,
          marginTop: 40,
        }}
      >
        {tripMetadata && user && tripMetadata.author_id === user.id ? (
          <InviteButton tripId={tripMetadata.id} />
        ) : null}
        <ContainedButton
          TitleComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Icon
                icon={Platform.OS === "ios" ? "shareIOSIcon" : "shareIcon"}
                size={18}
                color={Colors.light.primary}
              />
              <Text
                style={{
                  color: Colors.light.primary,
                  fontSize: 16,
                  fontFamily: "Outfit_600SemiBold",
                }}
              >
                {t("share.share")}
              </Text>
            </View>
          }
          onPress={async () => {
            track("Share trip clicked");
            try {
              await Share.share({
                message: `${t("share.checkOut")}\n\n${
                  tripMetadata?.name
                }\n\n\nhttps://app.favel.net/trip/${tripMetadata?.id}`,
              });
            } catch (error) {
              alert(error);
            }
          }}
          style={{
            marginTop: 0,
          }}
          type="ghostLight"
        />
      </View>
    </>
  );
}
