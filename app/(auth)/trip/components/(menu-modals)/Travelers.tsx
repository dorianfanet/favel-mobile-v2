import { View } from "react-native";
import React, { useEffect } from "react";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTrip } from "@/context/tripContext";
import { padding } from "@/constants/values";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import UserCard from "@/components/UserCard";
import { track } from "@amplitude/analytics-react-native";
import ShareCTA from "../ShareCTA";

export default function Travelers() {
  const { tripMetadata, userActivity } = useTrip();

  useEffect(() => {
    track("Travelers modal viewed");
  }, []);

  return (
    <BottomSheetScrollView
      style={{
        padding,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          color: Colors.dark.primary,
          fontFamily: "Outfit_600SemiBold",
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        Créateur du voyage
      </Text>
      <UserCard
        userId={tripMetadata?.author_id}
        theme="dark"
        DetailsComponent={() => {
          const recentActivity = userActivity?.activity.find(
            (activity) => activity.user_id === tripMetadata?.author_id
          );
          return recentActivity ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 2,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#2ffe4b",
                  marginRight: 5,
                }}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: Colors.dark.secondary,
                  fontFamily: "Outfit_400Regular",
                }}
              >
                En ligne
              </Text>
            </View>
          ) : null;
        }}
      />
      {tripMetadata?.invited_ids && tripMetadata.invited_ids.length > 0 && (
        <>
          <Text
            style={{
              fontSize: 18,
              color: Colors.dark.primary,
              fontFamily: "Outfit_600SemiBold",
              marginTop: 40,
              marginBottom: 20,
            }}
          >
            Invités
          </Text>
          {tripMetadata.invited_ids.map((id) => (
            <UserCard
              userId={id}
              theme="dark"
              DetailsComponent={() => {
                const recentActivity = userActivity?.activity.find(
                  (activity) => activity.user_id === id
                );
                return recentActivity ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#2ffe4b",
                        marginRight: 5,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        color: Colors.dark.secondary,
                        fontFamily: "Outfit_400Regular",
                      }}
                    >
                      En ligne
                    </Text>
                  </View>
                ) : null;
              }}
            />
          ))}
        </>
      )}
      <View
        style={{
          height: 350,
          marginTop: 50,
          paddingHorizontal: padding,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ShareCTA />
      </View>
    </BottomSheetScrollView>
  );
}
