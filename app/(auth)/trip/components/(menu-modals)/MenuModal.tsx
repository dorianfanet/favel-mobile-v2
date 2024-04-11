import {
  View,
  DimensionValue,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  StatusBar,
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
import { BlurView, Text } from "@/components/Themed";
import ImageWithFallback from "@/components/ImageWithFallback";
import {
  Stack,
  router,
  useLocalSearchParams,
  usePathname,
  useSegments,
} from "expo-router";
import { padding } from "@/constants/values";
import TripEditCard from "../TripEditCard";
import { months } from "@/constants/data";
import { supabase } from "@/lib/supabase";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Travelers from "./Travelers";
import Icon from "@/components/Icon";
import UserActivityCount from "@/components/UserActivityCount";
// import * as MailComposer from "expo-mail-composer";

export default function MenuModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => [340], []);
  const historySnapPoints = useMemo(() => ["100%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const historyModalRef = useRef<BottomSheetModal>(null);
  const travelersModalRef = useRef<BottomSheetModal>(null);

  function handleModalLinkPress() {
    bottomSheetModalRef.current?.dismiss();
    StatusBar.setBarStyle("light-content");
  }

  const { tripMetadata, userActivity } = useTrip();

  const inset = useSafeAreaInsets();

  return (
    <>
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
                  uri: `https://storage.googleapis.com/favel-photos/hotspots/${tripMetadata?.route?.[0]?.id}-700.jpg`,
                }}
                fallbackSource={require("@/assets/images/no-image.png")}
              />
            </View>
            <View
              style={{
                gap: 5,
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 18,
                }}
              >
                {tripMetadata?.name}
              </Text>
              {tripMetadata?.dates &&
                tripMetadata.dates.type === "flexDates" && (
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Outfit_400Regular",
                      fontSize: 12,
                      opacity: 0.8,
                    }}
                  >
                    {`${tripMetadata.dates.duration} jours en ${
                      months[tripMetadata.dates.month]
                    }`}
                  </Text>
                )}
            </View>
          </View>
          <View
            style={{
              borderRadius: 15,
              overflow: "hidden",
              gap: 1,
            }}
          >
            <MenuButton
              title="Historique des modifications"
              onPress={() => {
                handleModalLinkPress();
                historyModalRef.current?.present();
              }}
            />
            <MenuButton
              title="Voyageurs"
              onPress={() => {
                handleModalLinkPress();
                travelersModalRef.current?.present();
              }}
              // notifications={userActivity?.count}
              NotificationsComponent={() => (
                <UserActivityCount userActivity={userActivity} />
              )}
            />
            {/* <MenuButton
              title="Signaler un problème"
              onPress={() => {}}
            />
            <MenuButton
              title="Partager le voyage"
              onPress={() => {}}
            /> */}
            {/* <FlatList
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
                      // setPage("/history");
                      handleHistoryPress();
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
            /> */}
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
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={historyModalRef}
        index={0}
        snapPoints={historySnapPoints}
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
          backgroundColor: "transparent",
        }}
        handleComponent={(props) => (
          <View
            style={{
              backgroundColor: "",
              height: inset.top + 50,
            }}
            {...props}
          ></View>
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            enableTouchThrough={true}
            pressBehavior="close"
          />
        )}
        onDismiss={() => {
          StatusBar.setBarStyle("dark-content");
        }}
      >
        <View
          style={{
            marginTop: inset.top,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 50,
            position: "relative",
            // marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: Colors.dark.primary,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            Historique des modifications
          </Text>
        </View>
        <TripEdits />
      </BottomSheetModal>
      <BottomSheetModal
        ref={travelersModalRef}
        index={0}
        snapPoints={historySnapPoints}
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
          backgroundColor: "transparent",
        }}
        handleComponent={(props) => (
          <View
            style={{
              backgroundColor: "",
              height: inset.top + 50,
            }}
            {...props}
          ></View>
        )}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            enableTouchThrough={true}
            pressBehavior="close"
          />
        )}
        onDismiss={() => {
          StatusBar.setBarStyle("dark-content");
        }}
      >
        <View
          style={{
            marginTop: inset.top,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: 50,
            position: "relative",
            // marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              color: Colors.dark.primary,
              fontFamily: "Outfit_600SemiBold",
            }}
          >
            Voyageurs
          </Text>
        </View>
        <Travelers />
      </BottomSheetModal>
    </>
  );
}

function TripEdits() {
  const { tripEdits, setTripEdits, tripMetadata } = useTrip();

  async function fetchTripEdits() {
    const { data, error } = await supabase
      .from("tripv2_edits")
      .select("*")
      .eq("trip_id", tripMetadata?.id)
      .order("created_at", { ascending: false });

    if (data) {
      console.log(data);
      setTripEdits(data);
    }
  }

  useEffect(() => {
    fetchTripEdits();
  }, []);

  return (
    <>
      {tripEdits && tripEdits.length > 0 ? (
        <BottomSheetFlatList
          contentContainerStyle={{
            rowGap: 10,
            paddingBottom: 60,
          }}
          style={{
            padding: 0,
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
            width: "100%",
            height: "100%",
            padding: padding,
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Outfit_600SemiBold",
              fontSize: 18,
              textAlign: "center",
            }}
          >
            Vous n'avez pas encore modifié votre voyage. Déplacez, ajoutez ou
            supprimez des activités pour voir les modifications ici.
          </Text>
        </View>
      )}
    </>
  );
}

function MenuButton({
  title,
  onPress,
  notifications,
  NotificationsComponent,
}: {
  title: string;
  onPress: () => void;
  notifications?: number;
  NotificationsComponent?: React.ComponentType;
}) {
  return (
    <TouchableOpacity
      style={{
        height: 45,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: padding,
        backgroundColor: "#3d638771",
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: "white",
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
        }}
      >
        {title}
      </Text>
      {NotificationsComponent ? <NotificationsComponent /> : null}
      {/* {notifications && notifications > 0 && (
          <View
            style={{
              position: "absolute",
              right: padding,
              top: 20,
              height: 14,
              width: 14,
              backgroundColor: Colors.light.notification,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 10,
                fontFamily: "Outfit_500Medium",
                textAlign: "center",
              }}
            >
              {notifications > 9 ? "9+" : notifications}
            </Text>
          </View>
        )} */}
      {/* {notificationComponent ? (
        notificationComponent
      ) : (
        <View
          style={{
            position: "absolute",
            right: padding,
            top: 20,
            height: 10,
            width: 10,
            backgroundColor: Colors.light.notification,
            borderRadius: 10,
          }}
        ></View>
      )} */}
    </TouchableOpacity>
  );
}
