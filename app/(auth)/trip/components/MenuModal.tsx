import {
  View,
  Text,
  DimensionValue,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFlatListMethods,
  BottomSheetFooter,
  BottomSheetModal,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { Activity, FormattedTrip, Route, Trip } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { FlatList } from "react-native-gesture-handler";
import { ScrollView } from "react-native-gesture-handler";
import { BlurView } from "@/components/Themed";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  router,
  useLocalSearchParams,
  usePathname,
  useSegments,
} from "expo-router";
import { padding } from "@/constants/values";
import TripEditCard from "./TripEditCard";
// import * as MailComposer from "expo-mail-composer";

const menus = [
  {
    title: "Historique des modifications",
    value: "history",
  },
  {
    title: "Signaler un problème",
    value: "reportIssue",
  },
  {
    title: "Partager le voyage",
    value: "share",
  },
];

export default function MenuModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => [340], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [page, setPage] = useState<"/" | "/history">("/");

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backgroundComponent={(props) => (
        <View
          style={{
            flex: 1,
            padding: 0,
            margin: 0,
          }}
          {...props}
        >
          <BlurView />
        </View>
      )}
      handleIndicatorStyle={{
        backgroundColor: "white",
      }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          enableTouchThrough={true}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView
        style={{
          padding: padding,
          gap: 30,
        }}
      >
        {page === "/" && (
          <>
            <View
              style={{
                flexDirection: "row",
                gap: 15,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                  overflow: "hidden",
                }}
              >
                <ImageWithFallback
                  style={{ width: "100%", height: "100%", borderRadius: 10 }}
                  source={{
                    uri: `https://storage.googleapis.com/favel-photos/activites/7841135a-02a2-4d95-9cb6-a9ecbff96d73-400.jpg`,
                  }}
                  fallbackSource={require("@/assets/images/adaptive-icon.png")}
                />
              </View>
              <View
                style={{
                  gap: 5,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 18,
                  }}
                >
                  Voyage en Allemagne
                </Text>
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_400Regular",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  Du 4 au 9 juin
                </Text>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#3d638771",
                borderRadius: 15,
              }}
            >
              <FlatList
                data={menus}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      height: 45,
                      justifyContent: "center",
                      paddingHorizontal: padding,
                    }}
                    onPress={() => {
                      if (item.value === "reportIssue") {
                        // MailComposer.composeAsync({
                        //   recipients: ["contact@favel.net"],
                        // });
                      } else {
                        // router.navigate(`/(auth)${pathname}/menu/` + item.value);
                        // router.push(`/(auth)/(menu)/history/${tripMetadata!.id}`);
                        setPage("/history");
                      }
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "Outfit_500Medium",
                        fontSize: 16,
                      }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#1D3852",
                    }}
                  />
                )}
              />
              {/* <Pressable
            style={{
              height: 45,
              justifyContent: "center",
              paddingHorizontal: padding,
            }}
          >
            <Text
              style={{
                color: "white",
                fontFamily: "Outfit_500Medium",
                fontSize: 16,
              }}
            >
              Historique des modifications
            </Text>
          </Pressable> */}
            </View>
          </>
        )}
        {page === "/history" && <TripEdits />}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

function TripEdits() {
  const { tripEdits } = useTrip();

  return (
    <>
      {tripEdits && tripEdits.length > 0 ? (
        <FlatList
          contentContainerStyle={{
            rowGap: 10,
            paddingBottom: 60,
          }}
          style={{
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
            width: "100%",
            height: "100%",
          }}
        >
          <Text>Vous n'avez pas encore modifié votre voyage</Text>
        </View>
      )}
    </>
  );
}
