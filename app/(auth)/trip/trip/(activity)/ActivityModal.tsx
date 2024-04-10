import { TouchableOpacity, View } from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BlurView, Text } from "@/components/Themed";
import { useEditor } from "@/context/editorContext";
import { padding } from "@/constants/values";
import ImageWithFallback from "@/components/ImageWithFallback";
import { Activity, Category } from "@/types/types";
import { getActivity } from "@/lib/supabase";
import { categories, colors as categoryColor } from "@/constants/categories";
import Icon, { IconProps } from "@/components/Icon";
import Colors from "@/constants/Colors";
import { formatHoursToHoursAndMinutes } from "@/lib/utils";
import * as Linking from "expo-linking";
import * as MailComposer from "expo-mail-composer";

export default function ActivityModal() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => [340, "80%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const [activityData, setActivityData] = useState<Activity | null>(null);

  const { editor, setEditor } = useEditor();

  async function fetchActivity() {
    if (editor && editor.type === "activity") {
      const activity = await getActivity({
        id: editor.activity.id,
        formattedType: "activity",
      });
      setActivityData(activity);
    }
  }

  useEffect(() => {
    if (editor?.type === "activity" && !editor?.scrollOnly) {
      fetchActivity();
      setTimeout(() => {
        bottomSheetModalRef.current?.present();
      }, 200);
    } else {
      bottomSheetModalRef.current?.dismiss();
      setActivityData(null);
    }
  }, [editor]);

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
      onDismiss={() => setEditor(null)}
    >
      <BottomSheetScrollView
        style={{
          padding: padding,
        }}
      >
        {activityData ? (
          <>
            <View style={{}}>
              <Text
                style={{
                  fontFamily: "Outfit_600SemiBold",
                  fontSize: 24,
                  color: Colors.dark.primary,
                  marginBottom: 5,
                }}
              >
                {activityData.name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  opacity: 1,
                  color: Colors.dark.primary,
                }}
              >
                {activityData.display_category}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginVertical: 20,
              }}
            >
              <ActivityButton
                accent
                icon="messageDotsIcon"
                title={`Poser une\nquestion`}
              />
              <ActivityButton
                icon="googleMapsIcon"
                title={`Voir sur\nGoogle Maps`}
                onPress={() => {
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${activityData.g_maps_id}`
                  );
                }}
              />
              <ActivityButton
                icon="alertIcon"
                title={`Signaler un\nproblème`}
                onPress={() => {
                  MailComposer.composeAsync({
                    recipients: ["contact@favel.net"],
                    subject: "Problème sur une activité",
                    body: `Votre message ici (décrivez le problème si possible):\n\n\n\n\n\n\nDonnées auto-générées, ne pas modifier :\nID: ${
                      activityData.id
                    }\n${JSON.stringify(activityData, null, 2)}`,
                  });
                }}
              />
              {/* <ActivityButton
                icon="menuIcon"
                title="Plus"
              /> */}
            </View>
            <View
              style={{
                width: "100%",
                height: 250,
                position: "relative",
              }}
            >
              <ImageWithFallback
                key={activityData.id}
                style={{ width: "100%", height: "100%", borderRadius: 20 }}
                source={{
                  uri: `https://storage.googleapis.com/favel-photos/activites/${activityData.id}-700.jpg`,
                }}
                fallbackSource={require("@/assets/images/adaptive-icon.png")}
              />
              <View
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: categories.includes(
                    activityData.category as Category
                  )
                    ? categoryColor[activityData.category as Category]
                    : categoryColor.unknown,
                  padding: 5,
                  borderRadius: 12,
                  width: 30,
                  height: 30,
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                  gap: 5,
                }}
              >
                <Icon
                  icon={`${
                    categories.includes(activityData.category as Category)
                      ? (activityData.category as Category)
                      : "unknown"
                  }Icon`}
                  size={15}
                  color={"white"}
                />
                {/* <Text
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  {activityData.display_category}
                </Text> */}
              </View>
              {activityData.avg_duration && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: Colors.dark.accent,
                    padding: 5,
                    borderRadius: 12,
                    height: 30,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 5,
                  }}
                >
                  <Icon
                    icon="stopwatchIcon"
                    size={15}
                    color={"white"}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontFamily: "Outfit_600SemiBold",
                    }}
                  >
                    {formatHoursToHoursAndMinutes(activityData.avg_duration)}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={{
                borderRadius: 20,
                marginTop: 20,
                position: "relative",
                overflow: "hidden",
                marginBottom: 50,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: Colors.dark.primary,
                  opacity: 0.2,
                }}
              />
              <View
                style={{
                  padding: 15,
                  paddingHorizontal: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 16,
                    color: Colors.dark.primary,
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
                  ultrices posuere purus vitae efficitur. Phasellus luctus nisl
                  eu porta bibendum. Donec aliquet purus et leo congue, vitae
                  aliquet risus efficitur. Aliquam in nulla non nisi rutrum
                  finibus non at felis. Maecenas risus dui, lobortis nec commodo
                  a, sagittis a enim. Nulla ut feugiat neque, non tincidunt
                  metus. Ut sit amet nisl quam. Integer dictum enim id elementum
                  ullamcorper. Vivamus a ipsum ac risus viverra consequat eget
                  ultricies diam.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text>Chargement...</Text>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function ActivityButton({
  accent,
  icon,
  title,
  onPress,
}: {
  accent?: boolean;
  icon: IconProps["icon"];
  title: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        flex: 1,
        height: 75,
        borderRadius: 10,
        overflow: "hidden",
        position: "relative",
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: accent ? Colors.light.accent : Colors.dark.primary,
          opacity: accent ? 1 : 0.2,
          position: "absolute",
        }}
      />
      <View
        style={{
          paddingVertical: 5,
          paddingTop: 7,
          justifyContent: "space-around",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Icon
          icon={icon}
          size={20}
          color={Colors.dark.primary}
        />
        <Text
          style={{
            color: Colors.dark.primary,
            fontSize: 12,
            fontFamily: "Outfit_600SemiBold",
            textAlign: "center",
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
