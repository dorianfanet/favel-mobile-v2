import { Text, TouchableOpacity } from "react-native";
import React, { RefObject, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import "react-native-get-random-values";
import Colors from "@/constants/Colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useTrip } from "@/context/tripContext";
import { BottomSheetFlatListMethods } from "@gorhom/bottom-sheet";
import { borderRadius } from "@/constants/values";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";
import { TripMetadata } from "@/types/types";
import { useNewTripForm } from "@/context/newTrip";

export default function ValidateRouteButton({
  listRef,
}: {
  listRef?: RefObject<BottomSheetFlatListMethods>;
}) {
  const opacity = useSharedValue(0);
  const height = useSharedValue(0);

  const { user } = useUser();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(2000, withTiming(opacity.value, { duration: 500 })),
      height: withDelay(2000, withTiming(height.value, { duration: 500 })),
    };
  });

  useEffect(() => {
    opacity.value = 1;
    height.value = 63;
  }, []);

  const { setDestinationData, tripMetadata, setTripMetadata } = useTrip();

  const { form } = useNewTripForm();

  const { id } = useLocalSearchParams();

  const { getToken } = useAuth();

  return (
    <Animated.View
      style={[
        {
          justifyContent: "center",
          alignItems: "center",
          borderRadius: borderRadius,
          // backgroundColor: "#0e3355",
          // paddingHorizontal: 7,
          marginHorizontal: 20,
          flex: 1,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        style={{
          backgroundColor: Colors.light.accent,
          padding: 10,
          borderRadius: borderRadius,
          alignItems: "center",
          width: "100%",
        }}
        onPress={async () => {
          if (!tripMetadata) return;
          setDestinationData(null);
          if (tripMetadata && tripMetadata.route) {
            favelClient(getToken).then((favel) => {
              if (!tripMetadata.route) return;
              favel.createTripName(tripMetadata.route, id as string);
            });
          }
          favelClient(getToken).then((favel) => {
            console.log(tripMetadata, tripMetadata.route);
            if (tripMetadata.route) {
              console.log("Creating trip");
              favel.createTrip(
                id as string,
                tripMetadata.route,
                user!.id,
                form
              );
            }
          });
          supabaseClient(getToken).then(async (supabase) => {
            const { error } = await supabase
              .from("trips_v2")
              .update({
                status: "trip.loading",
                dates: {
                  type: "flexDates",
                  duration: form.flexDates.duration,
                },
              })
              .eq("id", id);
            if (error) {
              console.log(error);
            }
          });
          await new Promise((resolve) => setTimeout(resolve, 500));
          setTripMetadata({
            ...(tripMetadata as TripMetadata),
            status: "trip.loading",
          });
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Outfit_600SemiBold",
            color: "white",
          }}
        >
          Créer mon voyage
        </Text>
      </TouchableOpacity>
      {/* <Text
        style={{
          fontSize: 14,
          fontFamily: "Outfit_600SemiBold",
          color: "white",
          textAlign: "center",
          margin: 10,
          opacity: 0.8,
          width: "100%",
        }}
      >
        {`Favel créera votre voyage à partir de cet itinéraire`}
      </Text> */}
    </Animated.View>
  );
}
