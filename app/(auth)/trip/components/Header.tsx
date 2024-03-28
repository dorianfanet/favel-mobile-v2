import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useRef } from "react";
import { router } from "expo-router";
import Icon, { IconByKey } from "@/components/Icon";
import Colors from "@/constants/Colors";
import { useTrip } from "@/context/tripContext";
import { BlurView, Text } from "@/components/Themed";
import { padding } from "@/constants/values";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
// import MenuModal from "./MenuModal";

export default function Header() {
  const { tripMetadata } = useTrip();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      <SafeAreaView
        style={{
          position: "absolute",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        {tripMetadata && tripMetadata.status?.includes("Loading") ? (
          <View
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              paddingHorizontal: padding,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BlurView
              style={{
                paddingHorizontal: 10,
                margin: 0,
                width: "100%",
                height: 60,
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderRadius: 15,
                position: "relative",
              }}
            >
              <ActivityIndicator
                color={"white"}
                style={{
                  position: "absolute",
                  left: 20,
                }}
              />
              <View style={{}}>
                <Text
                  style={{
                    color: "white",
                    fontFamily: "Outfit_600SemiBold",
                    fontSize: 16,
                  }}
                >
                  {tripMetadata.status_message
                    ? tripMetadata.status_message.message
                    : "Chargement..."}
                </Text>
                {tripMetadata.status_message &&
                  tripMetadata.status_message.details && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 3,
                        opacity: 0.8,
                      }}
                    >
                      <Icon
                        icon={
                          tripMetadata.status_message.details.icon as IconByKey
                        }
                        size={12}
                        color="white"
                      />
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 12,
                        }}
                      >
                        {tripMetadata.status_message.details.title}
                      </Text>
                    </View>
                  )}
              </View>
            </BlurView>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexDirection: "row",
              paddingHorizontal: padding,
              borderRadius: 15,
              overflow: "hidden",
            }}
          >
            <BlurView
              style={{
                flex: 0,
                width: 40,
                height: 40,
              }}
            >
              <Pressable
                onPress={() => {
                  router.navigate("/(auth)/(tabs)/home");
                }}
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon
                  icon="chevronLeftIcon"
                  size={20}
                  color={Colors.dark.primary}
                />
              </Pressable>
            </BlurView>
            {tripMetadata && tripMetadata.status?.startsWith("trip") && (
              <BlurView
                style={{
                  flex: 0,
                  width: 40,
                  height: 40,
                }}
              >
                <Pressable
                  onPress={handlePresentModalPress}
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    icon="menuIcon"
                    size={20}
                    color={Colors.dark.primary}
                  />
                </Pressable>
              </BlurView>
            )}
          </View>
        )}
      </SafeAreaView>
      {/* <MenuModal bottomSheetModalRef={bottomSheetModalRef} /> */}
    </>
  );
}
