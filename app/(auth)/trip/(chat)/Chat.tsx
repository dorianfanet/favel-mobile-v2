import {
  View,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
} from "react-native";
import React from "react";
import { padding } from "@/constants/values";
import { BlurView, Text } from "@/components/Themed";
import Icon from "@/components/Icon";
import Colors from "@/constants/Colors";
import { MotiView } from "moti";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useTrip } from "@/context/tripContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import UserCard from "@/components/UserCard";

const messages = [
  {
    id: "1",
    userId: "user_2fKab1OOohOHLPDm8YYccPEX46a",
    content: "Hello",
  },
  {
    id: "2",
    userId: "user_2ea0y1fiwXkmnqJdbFwBYIHrpm3",
    content: "Hi",
  },
  {
    id: "3",
    userId: "user_2fKab1OOohOHLPDm8YYccPEX46a",
    content: "How are you?",
  },
  {
    id: "4",
    userId: "user_2ea0y1fiwXkmnqJdbFwBYIHrpm3",
    content: "I'm fine, thanks!",
  },
  {
    id: "5",
    userId: "user_2fKab1OOohOHLPDm8YYccPEX46a",
    content: "Good to hear!",
  },
  {
    id: "6",
    userId: "user_2ea0y1fiwXkmnqJdbFwBYIHrpm3",
    content: "Goodbye",
  },
  {
    id: "7",
    userId: "user_2fKab1OOohOHLPDm8YYccPEX46a",
    content: "Bye",
  },
];

export default function Chat() {
  const [state, setState] = React.useState(false);
  const [width, setWidth] = React.useState(0);

  const { tripMetadata } = useTrip();

  const style = useAnimatedStyle(() => ({
    opacity: withTiming(state ? 1 : 0),
    transform: [
      {
        scale: withTiming(state ? 1 : 0),
      },
    ],
  }));

  const inset = useSafeAreaInsets();

  return (
    <MotiView
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
      animate={{
        opacity: state ? 1 : 0,
      }}
      pointerEvents="box-none"
    >
      <SafeAreaView
        style={{
          flex: 1,
          position: "absolute",
          top: 0,
          left: padding,
          right: padding,
          bottom: 0,
          shadowColor: Colors.light.primary,
          shadowOffset: {
            width: 0,
            height: 0,
          },
          shadowOpacity: 0.6,
          shadowRadius: 10,
          elevation: 10,
        }}
        pointerEvents="box-none"
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setWidth(width);
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: inset.top,
              width: "100%",
              height: "100%",
              transformOrigin: `${width - 80}px 20px`,
            },
            style,
          ]}
        >
          <BlurView
            style={{
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 20,
                height: 80,
                backgroundColor: Colors.dark.background,
                padding: 10,
                paddingRight: 0,
                // borderBottomColor: Colors.dark.background,
                // borderBottomWidth: 1,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  flexShrink: 1,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 100,
                    overflow: "hidden",
                  }}
                >
                  <ImageWithFallback
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 10,
                    }}
                    source={{
                      uri: `https://storage.googleapis.com/favel-photos/hotspots/${tripMetadata?.route?.[0]?.id}-700.jpg`,
                    }}
                    fallbackSource={require("@/assets/images/no-image.png")}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Outfit_600SemiBold",
                      fontSize: 18,
                    }}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {tripMetadata?.name}
                  </Text>
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "Outfit_400Regular",
                      fontSize: 14,
                      opacity: 0.8,
                    }}
                  >
                    2 en ligne
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setState((prev) => !prev)}
                style={{
                  padding: 10,
                }}
              >
                <Icon
                  icon="closeIconFixed"
                  size={20}
                  color={Colors.dark.primary}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={JSON.parse(JSON.stringify(messages)).reverse()}
              keyExtractor={(_, index) => index.toString()}
              inverted
              contentContainerStyle={{
                padding: 10,
                rowGap: 10,
              }}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: "100%",
                    flexDirection:
                      item.userId === "user_2fKab1OOohOHLPDm8YYccPEX46a"
                        ? "row-reverse"
                        : "row",
                    alignItems: "flex-end",
                  }}
                >
                  {item.userId !== "user_2fKab1OOohOHLPDm8YYccPEX46a" && (
                    <UserCard
                      userId={item.userId}
                      size="extraSmall"
                      avatarOnly
                    />
                  )}
                  <View
                    style={{
                      backgroundColor:
                        item.userId === "user_2fKab1OOohOHLPDm8YYccPEX46a"
                          ? Colors.dark.accent
                          : Colors.dark.background,
                      padding: 10,
                      borderRadius: 10,
                      maxWidth: "80%",
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "Outfit_400Regular",
                        fontSize: 16,
                      }}
                    >
                      {item.content}
                    </Text>
                  </View>
                </View>
              )}
            />
            <View
              style={{
                height: 60,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.dark.background,
              }}
            >
              <TextInput
                style={{
                  color: "white",
                  fontFamily: "Outfit_400Regular",
                  fontSize: 16,
                  padding: 10,
                  backgroundColor: "#06233aa9",
                  height: 40,
                  width: "95%",
                  borderRadius: 10,
                }}
                placeholder="Votre message..."
                placeholderTextColor="#ffffff6c"
              />
            </View>
          </BlurView>
          <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={60}
          />
        </Animated.View>
        {!state && (
          <TouchableOpacity
            onPress={() => setState((prev) => !prev)}
            style={{
              position: "absolute",
              top: 50,
              right: 82,
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon
              icon="messageDotsIcon"
              size={20}
              color={Colors.dark.primary}
            />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </MotiView>
  );
}
