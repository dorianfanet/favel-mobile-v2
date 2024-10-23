import { Button, Text, View } from "@/components/Themed";
import { padding } from "@/constants/values";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import {
  Dimensions,
  FlatList,
  SectionList,
  useColorScheme,
  ViewToken,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Trip } from "@/types/trip";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favel/favelApi";

function TripList() {
  const [trips, setTrips] = React.useState<Trip[]>([]);

  const { user } = useUser();

  console.log("User", user);

  const { getToken } = useAuth();

  // const loadTrip = (tripData: Trip) => {
  //   tripUtils.setTrip(dispatch, tripData);
  // };

  useEffect(() => {
    supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase.from("trips").select("*");

      if (error) {
        console.error("Error fetching trips", error);
        setTrips([]);
        return;
      }

      if (!data || data.length === 0) {
        console.error("No trips found");
        setTrips([]);
        return;
      }

      // convert data from snake_case to camelCase
      const camelData = data.map((trip) => {
        const camelTrip: Trip = {
          id: trip.id,
          name: trip.name,
          thumbnail: trip.thumbnail,
          createdAt: new Date(trip.created_at),
          creatorId: trip.creator_id,
          departureDate: new Date(trip.departure_date),
          returnDate: new Date(trip.return_date),
        };

        return camelTrip;
      });

      setTrips(camelData);
    });
  }, []);

  return (
    <>
      {/* <Button
        title="Hello"
        onPress={() => {
          favelClient(getToken).then(async (favel) => {
            const { data, error } = await favel
              .trip("17d26789-4532-4da5-bbe3-c64d424f3c84")
              .stage("")
              .get();
            console.log("data: ", JSON.stringify(data, null, 2));
            console.log("error: ", error);
          });
        }}
      /> */}
      <MaskedView
        style={{
          flex: 1,
          backgroundColor: "transparent",
          transform: [{ translateY: -10 }],
        }}
        maskElement={
          <View
            style={[
              {
                flex: 1,
                pointerEvents: "none",
              },
            ]}
          >
            <View
              style={{
                height: 10,
              }}
            />
            {/* <LinearGradient
            colors={["transparent", "black"]}
            locations={[0, 1]}
            style={{
              width: "100%",
              height: 100,
              pointerEvents: "none",
            }}
          /> */}
            <View
              style={{
                flex: 1,
                backgroundColor: "black",
              }}
            />
          </View>
        }
      >
        <FlatList
          data={trips}
          ListHeaderComponent={() => (
            <Text
              fontStyle="subtitle"
              style={{
                marginBottom: 20,
                paddingHorizontal: padding,
                marginTop: 30,
              }}
            >
              My Trips
            </Text>
          )}
          style={{
            flex: 1,
          }}
          renderItem={({ item, index }) => <TripCard trip={item} />}
          keyExtractor={(item, index) => item.id}
        />
      </MaskedView>
    </>
  );
}

export default React.memo(TripList);

const { width } = Dimensions.get("window");

export function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();

  return (
    <View
      style={{
        paddingHorizontal: padding,
      }}
    >
      <TouchableOpacity
        style={{
          width: "100%",
          height: width - padding * 2,
          borderRadius: 30,
        }}
        onPress={() => {
          router.push(`../trip/${trip.id}`);
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <ImageWithFallback
            source={{
              uri: trip.thumbnail,
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 30,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: "40%",
              left: 0,
              right: 0,
              bottom: 0,
              borderBottomLeftRadius: 29,
              borderBottomRightRadius: 29,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["transparent", "black"]}
              locations={[0, 1]}
              style={{
                flex: 1,
                pointerEvents: "none",
              }}
            />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: padding,
            right: padding,
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <Text
            fontStyle="title"
            style={{
              color: "white",
            }}
          >
            {trip.name}
          </Text>
          <Text
            fontStyle="caption"
            style={{
              color: "white",
            }}
          >
            {"23 > 28 July"}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
