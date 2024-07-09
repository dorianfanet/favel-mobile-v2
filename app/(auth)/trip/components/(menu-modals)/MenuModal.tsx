import { View, StatusBar } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import Colors from "@/constants/Colors";
import { TripMetadata } from "@/types/types";
import { useTrip } from "@/context/tripContext";
import { BlurView, Button, Text } from "@/components/Themed";
import ImageWithFallback from "@/components/ImageWithFallback";
import { borderRadius, padding } from "@/constants/values";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Travelers from "./Travelers";
import Icon from "@/components/Icon";
import UserActivityCount from "@/components/UserActivityCount";
import * as MailComposer from "expo-mail-composer";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { track } from "@amplitude/analytics-react-native";
import Edits from "../../../trip-old/trip/(chat)/Edits";
import UserCard from "@/components/UserCard";
import { formatTimestamp } from "@/lib/utils";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "expo-router";

export default function MenuModal({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) {
  const snapPoints = useMemo(() => [385], []);
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

  const { user } = useUser();

  const inset = useSafeAreaInsets();

  const router = useRouter();

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
        keyboardBlurBehavior="restore"
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
              <TripName name={tripMetadata?.name} />
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
                    {`${tripMetadata.dates.duration} jours`}
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
                track("history_modal_opened");
                handleModalLinkPress();
                historyModalRef.current?.present();
              }}
            />
            <MenuButton
              title="Voyageurs"
              onPress={() => {
                track("travelers_modal_opened");
                handleModalLinkPress();
                travelersModalRef.current?.present();
              }}
              // notifications={userActivity?.count}
              NotificationsComponent={() => (
                <UserActivityCount userActivity={userActivity} />
              )}
            />
            <MenuButton
              title="Comment ça marche ?"
              onPress={() => {
                track("how_it_works_modal_opened");
                router.push("/(modals)/onboarding");
              }}
            />
            <MenuButton
              title="Signaler un problème"
              onPress={() => {
                track("issue_reported");
                MailComposer.composeAsync({
                  recipients: ["contact@favel.net"],
                  subject: "Signalement d'un problème",
                  body: `Votre message ici (décrivez le problème si possible):\n\n\n\n\n\n\nDonnées auto-générées, ne pas modifier :\nID: ${
                    user?.id
                  }\nTrip ID: ${
                    tripMetadata?.id
                  }\nTimestamp: ${new Date().toISOString()}`,
                });
              }}
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
          <View
            style={{
              position: "absolute",
              top: 15,
              right: padding,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                historyModalRef.current?.dismiss();
              }}
            >
              <Icon
                icon="closeIconFixed"
                size={20}
                color={Colors.dark.primary}
              />
            </TouchableOpacity>
          </View>
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
            width: "100%",
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
          <View
            style={{
              position: "absolute",
              top: 15,
              right: padding,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                travelersModalRef.current?.dismiss();
              }}
            >
              <Icon
                icon="closeIconFixed"
                size={20}
                color={Colors.dark.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Travelers />
      </BottomSheetModal>
    </>
  );
}

function TripEdits() {
  const { tripEdits, setTripEdits, tripMetadata } = useTrip();

  const { getToken } = useAuth();

  async function fetchTripEdits() {
    supabaseClient(getToken).then(async (supabase) => {
      const { data, error } = await supabase
        .from("tripv2_edits")
        .select("*")
        .eq("trip_id", tripMetadata?.id)
        .order("created_at", { ascending: false });

      if (data) {
        console.log(data);
        setTripEdits(data);
      }
    });
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
            paddingHorizontal: padding,
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
            // <TripEditCard
            //   key={item.id}
            //   tripEdit={item}
            // />
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                {item.author_id ? (
                  <UserCard
                    userId={item.author_id}
                    theme="dark"
                    size="small"
                  />
                ) : null}
                {item.created_at && (
                  <Text
                    style={{
                      color: Colors.dark.primary,
                      fontSize: 12,
                      fontFamily: "Outfit_400Regular",
                    }}
                  >
                    {formatTimestamp(item.created_at)}
                  </Text>
                )}
              </View>
              <Edits
                key={item.id}
                edits={[
                  {
                    day_index: item.day_index,
                    location: item.location,
                    actions: [
                      {
                        action: item.type,
                        id: item.activity_id,
                      },
                    ],
                  },
                ]}
                noMargin
              />
            </View>
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

function TripName({ name }: { name: string | undefined }) {
  const [inputValue, setInputValue] = useState(name);
  const [state, setState] = useState<"view" | "edit">("view");

  const { tripMetadata, setTripMetadata } = useTrip();

  const { getToken } = useAuth();

  function handleRenameClick() {
    supabaseClient(getToken).then(async (supabase) => {
      const { error } = await supabase
        .from("trips_v2")
        .update({ name: inputValue })
        .eq("id", tripMetadata?.id);
      const { error: errorConversation } = await supabase
        .from("conversations")
        .update({ name: inputValue })
        .eq("id", tripMetadata?.conversation_id);

      if (errorConversation) {
        console.error(errorConversation);
      }

      if (error) {
        console.error(error);
      } else {
        setTripMetadata((prev) => {
          return {
            ...(prev as TripMetadata),
            name: inputValue,
          };
        });
      }
      setState("view");
    });
  }

  return state === "edit" ? (
    <View style={{}}>
      <BottomSheetTextInput
        style={{
          height: 40,
          borderRadius: borderRadius,
          backgroundColor: Colors.dark.secondary,
          padding: 10,
          color: "white",
          borderWidth: 1,
          borderColor: "#19466f",
        }}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder={name}
        onBlur={() => {
          setState("view");
        }}
        autoFocus
      />
      <Button
        title="Renommer"
        onPress={handleRenameClick}
      />
    </View>
  ) : (
    <Text
      style={{
        color: "white",
        fontFamily: "Outfit_600SemiBold",
        fontSize: 18,
      }}
    >
      {name}
      <TouchableOpacity
        onPress={() => {
          setState("edit");
        }}
      >
        <Icon
          icon="penIcon"
          size={20}
          color={Colors.dark.primary}
          style={{
            marginLeft: 10,
            opacity: 0.8,
          }}
        />
      </TouchableOpacity>
    </Text>
  );
}
