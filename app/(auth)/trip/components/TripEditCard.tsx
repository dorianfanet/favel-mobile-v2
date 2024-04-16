import { View } from "react-native";
import React, { useEffect } from "react";
import { Activity, TripEdit, UserMetadata } from "@/types/types";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import ActivityCard from "./ActivityCard";
import { formatTimestamp, getUserMetadata } from "@/lib/utils";
import { ActivityCardContent } from "./PlaceCard";

export default function TripEditCard({ tripEdit }: { tripEdit: TripEdit }) {
  const [name, setName] = React.useState<string | null>(null);

  console.log("TripEditCard", tripEdit);

  useEffect(() => {
    async function checkUser() {
      const user = await getUserMetadata(tripEdit.author_id);

      setName(user?.firstName || "Anonyme");
    }
    checkUser();
  }, [tripEdit]);

  return (
    <View
      style={{
        // backgroundColor: "white",
        padding: padding,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginVertical: 10,
        }}
      >
        <Icon
          icon={`${tripEdit.type}Icon`}
          size={20}
          color={editTypes[tripEdit.type]}
        />
        <Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_600SemiBold",
              color: Colors.dark.primary,
            }}
          >
            {`${name} `}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_400Regular",
              color: Colors.dark.primary,
            }}
          >
            a{" "}
            {
              <>
                {tripEdit.type === "move" && "déplacé"}
                {tripEdit.type === "delete" && "supprimé"}
              </>
            }{" "}
            cette activité
          </Text>
        </Text>
      </View>
      <View>
        {tripEdit.activity_id && (
          <ActivityCardContent
            activity={{
              id: tripEdit.activity_id,
              formattedType: "activity",
            }}
            theme="dark"
            style={{ paddingHorizontal: 0 }}
            noClick
          />
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
          gap: 5,
          opacity: 0.8,
        }}
      >
        {tripEdit.created_at && (
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 12,
              fontFamily: "Outfit_400Regular",
            }}
          >
            {formatTimestamp(tripEdit.created_at)}
          </Text>
        )}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 12,
              fontFamily: "Outfit_400Regular",
            }}
          >{`${
            tripEdit.day_index !== undefined
              ? `Jour ${tripEdit.day_index + 1}`
              : ""
          }`}</Text>
          <Icon
            icon={"mapPinIcon"}
            size={15}
            color={Colors.dark.primary}
          />
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 12,

              fontFamily: "Outfit_400Regular",
            }}
          >
            {tripEdit.location}
          </Text>
        </View>
      </View>
    </View>
  );
}
