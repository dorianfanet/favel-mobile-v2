import { View, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { borderRadius, padding } from "@/constants/values";
import { BlurView, Text } from "@/components/Themed";
import { useTrip } from "@/context/tripContext";
import { Day, Hotspot } from "@/types/types";
import { ScrollView } from "react-native-gesture-handler";
import ImageWithFallback from "@/components/ImageWithFallback";
import { ImageCard } from "../../new/route/Message";
import Colors from "@/constants/Colors";
import { AnimatePresence, MotiView } from "moti";

export default function Loading() {
  const { tripMetadata, trip } = useTrip();
  const [hotspot, setHotspot] = useState<Hotspot | null>(null);
  const [days, setDays] = useState<Day[]>([]);

  useEffect(() => {
    if (!tripMetadata) return;
    if (tripMetadata.status === "trip.loading" && trip) {
      if (trip.length > 0) {
        const lastDay = trip[trip.length - 1];
        const hotspotId = lastDay.hotspotId;
        const hotspot = tripMetadata.route?.find(
          (route) => route.id === lastDay.hotspotId
        );
        console.log("hotspot", hotspot);
        if (hotspot) {
          setHotspot(hotspot);
        }
        const daysOfHotspot = trip.filter((day) => day.hotspotId === hotspotId);
        setDays(daysOfHotspot);
      }
    }
  }, [trip, tripMetadata?.status]);

  return trip && trip.length > 0 ? (
    <SafeAreaView
      style={{
        position: "absolute",
        bottom: 0,
        left: padding,
        right: padding,
      }}
    >
      <View>
        <AnimatePresence exitBeforeEnter>
          <MotiView
            style={{
              right: 0,
              left: 0,
              position: "absolute",
              bottom: 0,
            }}
            key={hotspot?.id}
            from={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              type: "timing",
              duration: 500,
            }}
          >
            <BlurView
              style={{
                flex: 1,
                padding: padding,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 24,
                    fontFamily: "Outfit_600SemiBold",
                    color: "white",
                  }}
                >
                  {hotspot?.location}{" "}
                  <Text
                    style={{
                      fontSize: 16,
                      color: "white",
                      fontFamily: "Outfit_400Regular",
                    }}
                  >
                    {hotspot?.duration} jours
                  </Text>
                </Text>
              </View>
              <ScrollView
                horizontal
                contentContainerStyle={{
                  gap: 20,
                  marginTop: 10,
                }}
                style={{
                  borderRadius: borderRadius,
                }}
              >
                {days.map((day) => (
                  <DayCard
                    key={day.id}
                    day={day}
                  />
                ))}
              </ScrollView>
            </BlurView>
          </MotiView>
        </AnimatePresence>
      </View>
    </SafeAreaView>
  ) : null;
}

function DayCard({ day }: { day: Day }) {
  return day && "activities" in day ? (
    <View
      style={[
        {
          width: 150,
        },
      ]}
    >
      <View
        style={{
          width: 150,
          height: 150,
          position: "relative",
        }}
      >
        {day.activities && day.activities.length > 0 ? (
          <ImageWithFallback
            key={day.id + "1"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: borderRadius,
            }}
            source={{
              uri: `https://storage.googleapis.com/favel-photos/activites/${
                day.activities[day.activities.length - 1].id
              }-700.jpg`,
            }}
            fallbackSource={require("@/assets/images/no-image.png")}
          />
        ) : null}
      </View>
      {day.location ? (
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              width: "100%",
              gap: 5,
              marginTop: 5,
              borderRadius: 5,
              padding: 0,
            },
          ]}
        >
          <Text
            style={{
              color: Colors.dark.primary,
              fontSize: 12,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            {day.location}
          </Text>
        </View>
      ) : null}
    </View>
  ) : null;
}
