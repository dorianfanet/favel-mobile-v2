import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { router, useRouter } from "expo-router";
import Icon, { IconByKey } from "@/components/Icon";
import Colors from "@/constants/Colors";
import { useTrip } from "@/context/tripContext";
import { BlurView, Text } from "@/components/Themed";
import { borderRadius, padding } from "@/constants/values";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import MenuModal from "./(menu-modals)/MenuModal";
import UserActivityCount from "@/components/UserActivityCount";
import { track } from "@amplitude/analytics-react-native";
import LoadingStuckButton from "./LoadingStuckButton";
import ShareModal from "./ShareModal";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MMKV } from "@/app/_layout";

export default function Header() {
  const { tripMetadata, userActivity } = useTrip();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const shareModalRef = useRef<BottomSheetModal>(null);

  const handlePresentModalPress = useCallback(() => {
    track("Trip Menu clicked");
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
        {/* {tripMetadata && tripMetadata.status === "trip" ? (
          <OnboardingButton />
        ) : null} */}
        {tripMetadata && tripMetadata.status?.includes("loading") ? (
          <>
            {/* <LoadingStuckButton /> */}
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
                            tripMetadata.status_message.details
                              .icon as IconByKey
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
          </>
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
                  track("Back to home from trip");
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
            <View
              style={{
                flexDirection: "row",
                gap: 10,
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
                  // onPress={async () => {
                  //   track("Share trip clicked");
                  //   try {
                  //     const result = await Share.share({
                  //       message: `Rejoins-moi pour mon voyage sur Favel !\n\n${tripMetadata?.name}\n\n\https://app.favel.net/invite/${tripMetadata?.id}`,
                  //     });

                  //     if (result.action === Share.sharedAction) {
                  //       if (result.activityType) {
                  //         // shared with activity type of result.activityType
                  //       } else {
                  //         // shared
                  //       }
                  //     } else if (result.action === Share.dismissedAction) {
                  //       // dismissed
                  //     }
                  //   } catch (error) {
                  //     alert(error);
                  //   }
                  // }}
                  onPress={() => {
                    track("Header share button pressed");
                    shareModalRef.current?.present();
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Icon
                    icon={Platform.OS === "ios" ? "shareIOSIcon" : "shareIcon"}
                    size={20}
                    color={Colors.dark.primary}
                  />
                </Pressable>
              </BlurView>
              {tripMetadata && tripMetadata.status?.startsWith("trip") && (
                <View
                  style={{
                    position: "relative",
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
                  <View
                    style={{
                      position: "absolute",
                      bottom: -5,
                      right: -5,
                    }}
                  >
                    <UserActivityCount userActivity={userActivity} />
                  </View>
                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
      <MenuModal bottomSheetModalRef={bottomSheetModalRef} />
      <ShareModal bottomSheetModalRef={shareModalRef} />
    </>
  );
}

function OnboardingButton() {
  const [alreadySeen, setAlreadySeen] = useState(false);

  const scale = useSharedValue(1);
  const height = useSharedValue(0);
  // const opacity = useSharedValue(0);
  const marginBottom = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      height: height.value,
      // opacity: opacity.value,
      marginBottom: marginBottom.value,
    };
  });

  useEffect(() => {
    const alreadySeen = MMKV.getString("onboardingSeen");
    // const alreadySeen = false;
    if (alreadySeen) {
      setAlreadySeen(true);
    } else {
      scale.value = withRepeat(withTiming(0.95, { duration: 500 }), -1, true);
      height.value = withDelay(5000, withSpring(50));
      marginBottom.value = withDelay(5000, withSpring(10));
    }
  }, []);

  const router = useRouter();

  return !alreadySeen ? (
    <View
      style={{
        width: "100%",
      }}
    >
      <TouchableOpacity
        style={{
          width: "100%",
        }}
        onPress={() => {
          setAlreadySeen(true);
          router.push("/(modals)/onboarding");
        }}
      >
        <Animated.View
          style={[
            {
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: padding,
              backgroundColor: Colors.light.accent,
              height: 50,
              borderRadius: borderRadius,
              shadowColor: "#19c2d1",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.8,
              shadowRadius: 10,
              elevation: 3,
              opacity: 1,
            },
            animatedStyle,
          ]}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Outfit_700Bold",
              textAlign: "center",
              fontSize: 22,
            }}
          >
            Comment ça marche ?
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  ) : null;
}
