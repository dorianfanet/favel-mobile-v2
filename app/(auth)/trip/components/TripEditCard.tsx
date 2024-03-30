import { View } from "react-native";
import React, { useEffect } from "react";
import { Activity, TripEdit } from "@/types/types";
import Icon from "@/components/Icon";
import { editTypes } from "@/constants/categories";
import { supabase } from "@/lib/supabase";
import { Text } from "@/components/Themed";
import { mapPinIcon } from "@/constants/icons";
import Colors from "@/constants/Colors";
import { padding } from "@/constants/values";
import ActivityCard from "./ActivityCard";

export default function TripEditCard({ tripEdit }: { tripEdit: TripEdit }) {
  const [name, setName] = React.useState<string | null>(null);

  useEffect(() => {
    async function fetchName() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", tripEdit.author_id);
      if (error) console.error(error);
      if (data) {
        setName(data[0].full_name);
      }
    }

    fetchName();
  }, [tripEdit]);

  return (
    <View
      style={{
        backgroundColor: "white",
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
            }}
          >
            {`${name} `}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontFamily: "Outfit_400Regular",
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
          <ActivityCard
            activity={{
              id: tripEdit.activity_id,
              formattedType: "activity",
            }}
            theme="light"
            style={{ paddingHorizontal: 0 }}
          />
        )}
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 15,
          right: 15,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Text>{`${
          tripEdit.day_index !== undefined
            ? `Jour ${tripEdit.day_index + 1}`
            : ""
        }`}</Text>
        <Icon
          icon={"mapPinIcon"}
          size={15}
          color={Colors.light.primary}
        />
        <Text>{tripEdit.location}</Text>
      </View>
    </View>
  );
}
