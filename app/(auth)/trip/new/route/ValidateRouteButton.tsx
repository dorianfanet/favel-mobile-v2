import { Text, TouchableOpacity } from "react-native";
import React, { RefObject, useEffect, useRef } from "react";
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
import { borderRadius, padding } from "@/constants/values";
import { useAuth } from "@clerk/clerk-expo";
import { supabaseClient } from "@/lib/supabaseClient";
import { favelClient } from "@/lib/favelApi";

export default function ValidateRouteButton({
  listRef,
}: {
  listRef?: RefObject<BottomSheetFlatListMethods>;
}) {
  const opacity = useSharedValue(0);
  const height = useSharedValue(0);

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

  const { setDestinationData, tripMetadata } = useTrip();

  const { rest } = useLocalSearchParams();

  const id = rest[0];

  const router = useRouter();

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
          setDestinationData(null);
          if (tripMetadata && tripMetadata.route) {
            favelClient(getToken).then((favel) => {
              if (!tripMetadata.route) return;
              favel.createTripName(tripMetadata.route, id);
            });
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.navigate(`/(auth)/trip/${id}/trip`);
          await supabaseClient(getToken).then(async (supabase) => {
            const { error } = await supabase
              .from("trips_v2")
              .update({ status: "trip.init" })
              .eq("id", id);
            if (error) {
              console.log(error);
            }
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
