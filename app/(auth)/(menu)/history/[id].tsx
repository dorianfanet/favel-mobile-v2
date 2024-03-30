import { Text, StatusBar, Touchable } from "react-native";
import React, { useEffect } from "react";
import {
  Stack,
  useLocalSearchParams,
  usePathname,
  useSegments,
} from "expo-router";
import Colors from "@/constants/Colors";
import { View } from "@/components/Themed";
import { useTrip } from "@/context/tripContext";
import { FlatList } from "react-native-gesture-handler";
import TripEditCard from "../../trip/components/TripEditCard";

export default function index() {
  useEffect(() => {
    StatusBar.setBarStyle("light-content");
  });

  const { tripEdits } = useTrip();

  console.log("tripEdits", tripEdits);

  const { id } = useLocalSearchParams();
  console.log(id);

  return (
    <>
      <Stack.Screen
        options={{
          headerBackground: () => (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.light.accent,
              }}
            />
          ),
          headerTitleStyle: {
            color: "white",
            fontFamily: "Outfit_600SemiBold",
          },
          headerTintColor: "white",
          title: "Dernières modifications",
          headerBackTitle: "Retour",
        }}
      />
      {tripEdits && tripEdits.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            rowGap: 10,
            paddingBottom: 60,
          }}
          style={{
            // justifyContent: "center",
            // alignItems: "center",
            padding: 0,
            backgroundColor: Colors.light.background,
          }}
          data={tripEdits}
          keyExtractor={(item, index) =>
            item.id ? item.id : `tripEdit-${index}`
          }
          renderItem={({ item }) => (
            // <TripCard
            //   key={item.id}
            //   trip={item}
            // />
            <TripEditCard
              key={item.id}
              tripEdit={item}
            />
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: Colors.light.background,
          }}
        >
          <Text>Vous n'avez pas encore modifié votre voyage</Text>
        </View>
      )}
    </>
  );
}
