import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleProp,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextInputState,
  Keyboard,
  LayoutChangeEvent,
} from "react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, router, useRouter } from "expo-router";
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
import { AnimatePresence, MotiView } from "moti";
import { favelClient } from "@/lib/favelApi";
import { useAuth } from "@clerk/clerk-expo";
import { useTripUserRole } from "@/context/tripUserRoleContext";
import {
  Action as ActionType,
  Assistant,
  Button,
  useAssistant,
} from "@/context/assistantContext";
import ContainedButton from "@/components/ContainedButton";
import TypewriterMardown, {
  TypewriterText,
} from "@/components/TypewriterMardown";
import { useEditor } from "@/context/editorContext";
import { v4 as uuidv4 } from "uuid";
// import { LinearGradient } from "expo-linear-gradient";
// import MaskedView from "@react-native-masked-view/masked-view";

export default function Header() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {
    assistant,
    pushAssistant,
    canPopAssistant,
    clearAssistant,
    popAssistant,
  } = useAssistant();
  const { editor, setEditor } = useEditor();

  const [contentHeight, setContentHeight] = useState(35);
  const [inputFocused, setInputFocused] = useState(false);
  // const [backButton, setBackButton] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const followUpInputPosition = useRef(0);

  // useEffect(() => {
  //   if (inputFocused || assistant.state === "speaking") {
  //     setBackButton(true);
  //   }
  // }, [assistant.state, inputFocused]);

  function abortRequest() {
    // todo
  }

  return (
    <MotiView
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      from={{
        backgroundColor: "#8ab5dd0",
      }}
      animate={{
        backgroundColor:
          assistant.state === "loading" ? "#8ab5ddb2" : "#8ab5dd0",
        // backgroundColor: "#8ab5ddb2",
      }}
      transition={{
        type: "timing",
        duration: 300,
        delay: 0,
      }}
      pointerEvents={assistant.state === "loading" ? "auto" : "box-none"}
    >
      <SafeAreaView
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          top: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        }}
      >
        <View
          style={{
            width: "100%",
            paddingHorizontal: padding,
            position: "relative",
          }}
        >
          <MotiView
            style={{
              width: "100%",
              height: 50,
            }}
            from={{
              height: 50,
            }}
            animate={{
              height: contentHeight + 15,
            }}
            transition={{
              type: "timing",
              duration: 300,
              delay: 0,
            }}
          >
            <BlurView
              style={{
                width: "100%",
                borderRadius: 25,
                backgroundColor: "#1c769cae",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6.5,
                alignItems: "flex-start",
                borderWidth: 1,
                borderColor: "#ffffffb6",
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 35,
                  height: "100%",
                }}
              >
                <AnimatePresence>
                  <MotiView
                    exit={{
                      opacity: 0,
                      translateX: -30,
                    }}
                    animate={{
                      opacity: 1,
                      translateX: 0,
                    }}
                    from={{
                      opacity: 0,
                      translateX: -30,
                    }}
                    transition={{
                      type: "timing",
                      duration: 300,
                      delay: 100,
                    }}
                    exitTransition={{
                      type: "timing",
                      duration: 300,
                      delay: 0,
                    }}
                    key={
                      canPopAssistant || inputFocused
                        ? "backButton"
                        : "leaveButton"
                    }
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (canPopAssistant || inputFocused) {
                          if (inputFocused) {
                            setInputFocused(false);
                            Keyboard.dismiss();
                            setInputValue("");
                            // if (assistant.state === "default") {
                            //   setBackButton(false);
                            // }
                          } else {
                            // setAssistant({
                            //   state: "default",
                            //   key: "initial",
                            //   placeholder: "Ajoute une balade en forêt...",
                            // });
                            popAssistant();
                            if (editor && editor.type === "activity") {
                              setEditor(null);
                            }
                          }
                        } else {
                          track("Back to home from trip");
                          router.back();
                        }
                      }}
                      style={{
                        width: 35,
                        height: 35,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 20,
                        backgroundColor: "#74A5B5",
                      }}
                    >
                      <Icon
                        icon={
                          assistant.state === "loading"
                            ? "stopIcon"
                            : canPopAssistant || inputFocused
                            ? "chevronLeftIcon"
                            : "logoutIcon"
                        }
                        size={20}
                        color={Colors.dark.primary}
                        style={{
                          transform: [
                            {
                              rotate:
                                canPopAssistant || inputFocused
                                  ? "0deg"
                                  : "180deg",
                            },
                          ],
                        }}
                      />
                    </TouchableOpacity>
                  </MotiView>
                </AnimatePresence>
              </View>
              <AnimatePresence>
                <MotiView
                  exit={{
                    opacity: 0,
                    translateY: -20,
                  }}
                  animate={{
                    opacity: 1,
                    translateY: 0,
                  }}
                  from={{
                    opacity: 0,
                    translateY: 20,
                  }}
                  transition={{
                    type: "timing",
                    duration: 300,
                    delay: 0,
                  }}
                  style={{
                    flex: 1,
                    position: "absolute",
                    top: 6.5,
                    left: 41.5,
                    right: 41.5,
                  }}
                  onLayout={(e) => {
                    setContentHeight(e.nativeEvent.layout.height);
                  }}
                  key={assistant.key}
                >
                  {assistant.state === "loading" ? (
                    <Loader assistant={assistant} />
                  ) : null}
                  {assistant.state === "default" ? (
                    <Input
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      placeholder={assistant.placeholder}
                      onLayout={(e) => {
                        console.log(e.nativeEvent.layout.y);
                        followUpInputPosition.current = e.nativeEvent.layout.y;
                      }}
                      value={inputValue}
                      onChangeText={(text) => setInputValue(text)}
                    />
                  ) : null}
                  {assistant.state === "speaking" ? (
                    <View
                      style={{
                        padding: 10,
                        paddingTop: 7.5,
                        paddingBottom: 7.5,
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 16,
                          width: "100%",
                        }}
                        // numberOfLines={3}
                      >
                        {assistant.message}
                      </Text>
                      {/* <TypewriterText
                        key={"assistantMessage"}
                        text={assistant.message}
                        shouldAnimate={true}
                        style={{
                          color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 16,
                        }}
                      /> */}
                      {/* <MotiView
                        from={{
                          opacity: 0,
                          translateY: 20,
                        }}
                        animate={{
                          opacity: 1,
                          translateY: 0,
                        }}
                        transition={{
                          type: "timing",
                          duration: 100,
                          delay: 1000,
                        }}
                      > */}
                      {assistant.action ? (
                        <Action action={assistant.action} />
                      ) : null}
                      {assistant.followUp ? (
                        <Input
                          onFocus={() => setInputFocused(true)}
                          onBlur={() => setInputFocused(false)}
                          dark
                          style={{
                            marginTop: 8,
                          }}
                          onLayout={(e) => {
                            console.log(e.nativeEvent.layout.y);
                            followUpInputPosition.current =
                              e.nativeEvent.layout.y;
                          }}
                          value={inputValue}
                          onChangeText={(text) => setInputValue(text)}
                          autoFocus={assistant.followUp.autoFocus}
                          placeholder={assistant.followUp.placeholder}
                        />
                      ) : null}
                      {/* </MotiView> */}
                    </View>
                  ) : null}
                </MotiView>
              </AnimatePresence>
              <View
                style={{
                  width: 35,
                  height: "100%",
                }}
              >
                <AnimatePresence>
                  <MotiView
                    exit={{
                      opacity: 0,
                      translateX: 30,
                      top: !inputFocused ? 0 : followUpInputPosition.current,
                    }}
                    animate={{
                      opacity: 1,
                      translateX: 0,
                      top: inputFocused ? followUpInputPosition.current : 0,
                    }}
                    from={{
                      opacity: 0,
                      translateX: 30,
                      top: inputFocused ? followUpInputPosition.current : 0,
                    }}
                    transition={{
                      type: "timing",
                      duration: 300,
                      delay: 100,
                    }}
                    exitTransition={{
                      type: "timing",
                      duration: 300,
                      delay: 0,
                    }}
                    key={inputFocused ? "sendButton" : "menuButton"}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (inputFocused) {
                        } else {
                          bottomSheetModalRef.current?.present();
                        }
                      }}
                      style={{
                        width: 35,
                        height: 35,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 20,
                        backgroundColor: inputFocused
                          ? Colors.light.accent
                          : "#74A5B5",
                      }}
                    >
                      <Icon
                        icon={inputFocused ? "sendIcon" : "menuIcon"}
                        size={20}
                        color={Colors.dark.primary}
                      />
                    </TouchableOpacity>
                  </MotiView>
                </AnimatePresence>
              </View>
            </BlurView>
          </MotiView>
          {/* <MaskedView
            style={{
              flex: 1,
              flexDirection: "row",
              height: 50,
              position: "absolute",
              top: 0,
              left: padding,
              right: padding,
            }}
            maskElement={
              <View
                style={{
                  backgroundColor: "transparent",
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "black",
                  borderRadius: 25,
                }}
              ></View>
            }
          >
            <LinearGradient
              // Background Linear Gradient
              colors={[
                "rgba(255,255,255,0.8)",
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0)",
                "rgba(255,255,255,0.4)",
              ]}
              locations={[0, 0.41, 0.57, 1]}
              style={{
                width: "100%",
                position: "absolute",
                top: -14,
                height: 80,
                transform: [
                  {
                    rotate: "-5deg",
                  },
                ],
              }}
            />
          </MaskedView> */}
        </View>
      </SafeAreaView>
      <View
        style={{
          padding: padding,
          flexDirection: "row",
          gap: 10,
          marginTop: 300,
        }}
      >
        <ContainedButton
          title="default"
          onPress={() => {
            pushAssistant({
              state: "default",
              key: "1",
              placeholder: "Ajoute une balade en forêt...",
            });
          }}
        />
        <ContainedButton
          title="speaking"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "2",
              message:
                "Salut ! Je suis Favel votre assistant, avez-vous besoin d'aide ?",
              action: {
                type: "boolean",
                primary: {
                  text: "Oui",
                  action: "follow-up",
                },
                secondary: {
                  text: "Non",
                  action: "clear",
                },
              },
              // followUp: true,
            });
          }}
        />
        <ContainedButton
          title="list"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "2",
              message:
                "Quel type d'activité souhaitez-vous faire pendant votre séjour ?",
              action: {
                type: "list",
                items: ["Campagne", "Visites culturelles", "Détente"],
              },
              followUp: {
                placeholder: "Autre chose ?",
              },
            });
          }}
        />
        <ContainedButton
          title="loading"
          onPress={() => {
            pushAssistant({
              state: "loading",
              key: `loading`,
              message: "Je réfléchis...",
            });
          }}
        />
      </View>
      <MenuModal bottomSheetModalRef={bottomSheetModalRef} />
      {/*<ShareModal bottomSheetModalRef={shareModalRef} /> */}
    </MotiView>
  );
}

function Input({
  onFocus,
  onBlur,
  onLayout,
  dark = false,
  placeholder = "Écrivez votre réponse...",
  style,
  value,
  onChangeText,
  autoFocus = false,
}: {
  onFocus: () => void;
  onBlur: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  dark?: boolean;
  placeholder?: string;
  style?: any;
  value: string;
  onChangeText: (text: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <TextInput
      style={[
        {
          color: "white",
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          backgroundColor: dark ? "rgba(0,0,0,0.1)" : "transparent",
          borderWidth: 0,
          flex: 1,
          height: 35,
          marginVertical: 0,
          borderRadius: 12,
          paddingVertical: 0,
          paddingHorizontal: 10,
        },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#ffffff91"
      onFocus={onFocus}
      onBlur={onBlur}
      onLayout={onLayout}
      value={value}
      onChangeText={onChangeText}
      autoFocus={autoFocus}
      selectionColor="#ffffffba"
    />
  );
}

function Action({ action }: { action: ActionType }) {
  const {
    assistant,
    pushAssistant,
    canPopAssistant,
    clearAssistant,
    replaceAssistant,
    popAssistant,
  } = useAssistant();

  function handleButtonClick(clickAction: Button) {
    if (clickAction.action === "clear") clearAssistant();
    if (clickAction.action === "pop") popAssistant();
    if (clickAction.action === "follow-up" && assistant.state === "speaking") {
      replaceAssistant({
        ...assistant,
        followUp: {
          placeholder: "Écrivez votre réponse...",
          autoFocus: true,
        },
        action: null,
      });
    }
    if (clickAction.action === "push") {
      pushAssistant(clickAction.assistant);
    }
    if (clickAction.action === "replace") {
      replaceAssistant(clickAction.assistant);
    }
  }

  return (
    <>
      {action.type === "boolean" ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 8,
          }}
        >
          <ContainedButton
            title={action.secondary.text}
            onPress={() => handleButtonClick(action.secondary)}
            type="ghost"
            style={{
              flex: 1,
              paddingHorizontal: 0,
              paddingVertical: 7,
              borderRadius: 8,
            }}
          />
          <ContainedButton
            title={action.primary.text}
            onPress={() => handleButtonClick(action.primary)}
            style={{
              flex: 1,
              paddingHorizontal: 0,
              paddingVertical: 7,
              borderRadius: 8,
            }}
          />
        </View>
      ) : null}
      {action.type === "list" ? (
        <View
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 8,
          }}
        >
          {action.items.map((item, index) => (
            <ContainedButton
              key={index}
              title={item}
              onPress={() => {}}
              style={{
                paddingHorizontal: 0,
                paddingVertical: 7,
                borderRadius: 8,
              }}
              type="ghost"
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

function Loader({ assistant }: { assistant: Assistant }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (assistant.state !== "loading") return;

    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 610); // Match this delay with the parent's animation duration

    return () => clearTimeout(timer);
  }, [assistant.state]);

  return shouldAnimate ? (
    <MotiView
      from={{
        opacity: 0.3,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0.3,
      }}
      transition={{
        type: "timing",
        duration: 500,
        repeat: Infinity,
        delay: 0,
      }}
      // key={`${assistant.key}-loading`}
      key="biusd"
      style={{
        padding: 10,
        paddingTop: 7.5,
        paddingBottom: 7.5,
        flex: 1,
      }}
    >
      <Text
        style={{
          color: "#dfebf9",
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          width: "100%",
        }}
        // numberOfLines={3}
      >
        {assistant.state === "loading" ? assistant.message : "Chargement..."}
      </Text>
    </MotiView>
  ) : (
    <View
      style={{
        padding: 10,
        paddingTop: 7.5,
        paddingBottom: 7.5,
        flex: 1,
        opacity: 0.3,
      }}
    >
      <Text
        style={{
          color: "#dfebf9",
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          width: "100%",
        }}
        // numberOfLines={3}
      >
        {assistant.state === "loading" ? assistant.message : "Chargement..."}
      </Text>
    </View>
  );
}
