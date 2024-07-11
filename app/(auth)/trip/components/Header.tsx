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
  FullConversation,
  useAssistant,
} from "@/context/assistantContext";
import ContainedButton from "@/components/ContainedButton";
import TypewriterMardown, {
  TypewriterText,
} from "@/components/TypewriterMardown";
import { useEditor } from "@/context/editorContext";
import { v4 as uuidv4 } from "uuid";
import CircularProgress from "@/components/CircularProgress/CircularProgress";
import { Picker } from "@react-native-picker/picker";
// import { LinearGradient } from "expo-linear-gradient";
// import MaskedView from "@react-native-masked-view/masked-view";

const tripState = "new";

export default function Header() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const {
    assistant,
    pushAssistant,
    canPopAssistant,
    replaceAssistant,
    popAssistant,
    setConversation,
    clearAssistant,
    conversation,
  } = useAssistant();
  const { editor, setEditor } = useEditor();

  const [contentHeight, setContentHeight] = useState(35);
  const [inputFocused, setInputFocused] = useState(false);
  // const [backButton, setBackButton] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const { getToken } = useAuth();

  const followUpInputPosition = useRef(0);

  // useEffect(() => {
  //   if (inputFocused || assistant.state === "speaking") {
  //     setBackButton(true);
  //   }
  // }, [assistant.state, inputFocused]);

  function abortRequest() {
    // todo
  }

  async function sendMessage(
    response?: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) {
    if (abortController) {
      abortController.abort(); // Abort any previous request
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    const signal = newAbortController.signal;

    const value = response ? response : inputValue;
    setInputFocused(false);
    setInputValue("");
    if (assistant.state === "speaking" && assistant.shouldReplace) {
      replaceAssistant({
        state: "loading",
        key: `loading`,
        message: "Je réfléchis...",
      });
    } else {
      // if (!canPopAssistant) {
      pushAssistant({
        state: "loading",
        key: `loading`,
        message: "Je réfléchis...",
      });
    }
    // } else {
    //   replaceAssistant({
    //     state: "loading",
    //     key: `loading`,
    //     message: "Je réfléchis...",
    //   });
    // }
    // }
    let conversationCopy;
    if (customConversation) {
      conversationCopy = customConversation;
    } else {
      conversationCopy = conversation
        ? JSON.parse(JSON.stringify(conversation))
        : {
            id: uuidv4(),
            messages: [],
          };
    }
    favelClient(getToken).then(async (favel) => {
      if (!avoidConversationUpdate) {
        if (
          conversationCopy.messages[conversationCopy.messages.length - 1]
            ?.role === "user"
        ) {
          conversationCopy.messages[
            conversationCopy.messages.length - 1
          ].content = value;
        } else {
          conversationCopy.messages.push({
            role: "user",
            content: value,
          });
        }
      }
      const { data, error } = await favel
        .assistant("test", signal)
        .send(value, conversationCopy);
      if (error) {
        replaceAssistant({
          state: "loading",
          key: `loading-retry`,
          message: "Encore un instant...",
        });
        const { data, error } = await favel
          .assistant("test", signal)
          .send(value, conversationCopy);
        if (error) {
          replaceAssistant({
            state: "speaking",
            key: `speaking-${uuidv4()}`,
            message: "Une erreur est survenue, veuillez réessayer.",
            action: {
              type: "list",
              items: [
                {
                  text: "Réessayer",
                  action: "retry",
                  response: value,
                },
              ],
            },
            shouldReplace: true,
          });
        }
        if (data) {
          replaceAssistant({
            state: "speaking",
            key: `speaking-${uuidv4()}`,
            message: data.message,
            action: data.action,
            followUp: data.followUp,
            timeout: data.timeout,
          });
          // addMessage({
          //   role: "assistant",
          //   content: data.message,
          // });
          conversationCopy.messages.push({
            role: "assistant",
            content: data.message,
          });
        }
      }
      if (data) {
        replaceAssistant({
          state: "speaking",
          key: `speaking-${uuidv4()}`,
          message: data.message,
          action: data.action,
          followUp: data.followUp,
          timeout: data.timeout,
        });
        // addMessage({
        //   role: "assistant",
        //   content: data.message,
        // });
        conversationCopy.messages.push({
          role: "assistant",
          content: data.message,
        });
      }
    });
    setConversation(conversationCopy);
  }

  useEffect(() => {
    if (assistant.state === "speaking" && assistant.timeout) {
      const timer = setTimeout(() => {
        popAssistant();
      }, assistant.timeout);
      return () => clearTimeout(timer);
    }
  }, [assistant]);

  console.log("assistant", assistant);

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
                        if (assistant.state === "loading") {
                          abortController?.abort();
                          popAssistant();
                          return;
                        }
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
                      {assistant.state === "speaking" && assistant.timeout ? (
                        <View
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            transform: [{ rotate: "-90deg" }],
                          }}
                        >
                          <CircularProgress
                            radius={20}
                            strokeWidth={5}
                            duration={assistant.timeout}
                            color={Colors.light.accent}
                          />
                        </View>
                      ) : null}
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
                      onSubmit={() => sendMessage()}
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
                        numberOfLines={3}
                      >
                        {assistant.message}
                      </Text>
                      {/* <TypewriterText
                        key={assistant.message}
                        text={assistant.message}
                        shouldAnimate={true}
                        style={{
                          color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 16,
                        }}
                        onAnimationEnd={() => {
                          console.log("animation end");
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
                        <Action
                          action={assistant.action}
                          assistantKey={assistant.key}
                          onResponse={(
                            response,
                            customConversation,
                            avoidConversationUpdate
                          ) =>
                            sendMessage(
                              response,
                              customConversation,
                              avoidConversationUpdate
                            )
                          }
                        />
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
                          onSubmit={() => sendMessage()}
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
                    key={
                      inputFocused
                        ? "sendButton"
                        : canPopAssistant
                        ? "closeButton"
                        : "menuButton"
                    }
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        if (inputFocused) {
                          sendMessage();
                        } else if (canPopAssistant) {
                          clearAssistant();
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
                        icon={
                          inputFocused
                            ? "sendIcon"
                            : canPopAssistant
                            ? "closeIcon"
                            : "menuIcon"
                        }
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
          title="timeout"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "23",
              message: "Salut, ce message est temporaire !",
              timeout: 5000,
            });
          }}
        />
        <ContainedButton
          title="default"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "1",
              message: "Salut, comment ça va ?",
              action: {
                type: "list",
                items: [
                  {
                    text: "Bien mais lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec odio.",
                    action: "response",
                  },
                  {
                    text: "Pas bien",
                    action: "response",
                  },
                ],
              },
            });
          }}
        />
        <ContainedButton
          title="speaking"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "duration",
              message: "Combien de temps partez-vous ?",
              // action: {
              //   type: "boolean",
              //   primary: {
              //     text: "Oui",
              //     action: "follow-up",
              //   },
              //   secondary: {
              //     text: "Non",
              //     action: "clear",
              //   },
              // },
              action: {
                type: "select",
                items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                label: "jours",
                button: {
                  text: "Suivant",
                  action: "next",
                  value: null,
                },
              },
              // followUp: true,
            });
          }}
        />
        {/* <ContainedButton
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
        /> */}
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
  onSubmit,
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
  onSubmit?: () => void;
}) {
  return (
    <TextInput
      style={[
        {
          color: "white",
          fontFamily: "Outfit_500Medium",
          fontSize: 16,
          backgroundColor: dark ? "rgba(0,0,0,0.2)" : "transparent",
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
      returnKeyType="send"
      onSubmitEditing={onSubmit}
    />
  );
}

function Action({
  action,
  assistantKey,
  onResponse,
}: {
  action: ActionType;
  assistantKey: string;
  onResponse?: (
    response: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) => void;
}) {
  const {
    assistant,
    pushAssistant,
    canPopAssistant,
    clearAssistant,
    replaceAssistant,
    popAssistant,
    nextForm,
  } = useAssistant();

  const [pickerValue, setPickerValue] = useState<number | string | null>(null);

  function handleButtonClick(clickAction: Button) {
    console.log("clickAction", clickAction);
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
    if (clickAction.action === "retry") {
      onResponse && onResponse(clickAction.response);
    }
    if (clickAction.action === "response") {
      onResponse && onResponse(clickAction.text);
    }
    if (clickAction.action === "next") {
      const res = nextForm(
        assistantKey,
        clickAction.value ? clickAction.value.toString() : clickAction.text
      );
      if (res) {
        onResponse &&
          onResponse(
            clickAction.value ? clickAction.value.toString() : clickAction.text,
            res.conversation,
            true
          );
      }
    }
  }

  return (
    <>
      {/* {action.type === "boolean" ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
            marginTop: 8,
          }}
        >
          {action.secondary ? (
            <ContainedButton
              title={action.secondary.text}
              onPress={() => handleButtonClick(action.secondary!)}
              type="ghost"
              style={{
                flex: 1,
                paddingHorizontal: 0,
                paddingVertical: 7,
                borderRadius: 8,
              }}
            />
          ) : null}
          {action.primary ? (
            <ContainedButton
              title={action.primary.text}
              onPress={() => handleButtonClick(action.primary!)}
              style={{
                flex: 1,
                paddingHorizontal: 0,
                paddingVertical: 7,
                borderRadius: 8,
              }}
            />
          ) : null}
        </View>
      ) : null} */}
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
              title={item.text}
              onPress={() => handleButtonClick(item)}
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
      {action.type === "select" ? (
        <>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20,
              width: "80%",
            }}
          >
            <Picker
              selectedValue={pickerValue}
              onValueChange={(itemValue, itemIndex) => {
                setPickerValue(itemValue === -1 ? null : itemValue);
              }}
              style={{
                flex: 1,
                color: "white",
              }}
              mode={"dropdown"}
              itemStyle={{
                fontSize: 16,
                fontFamily: "Outfit_600SemiBold",
                color: "white",
              }}
              dropdownIconColor={"white"}
            >
              <Picker.Item
                label="---"
                value={-1}
                fontFamily={"Outfit_600SemiBold"}
              />
              {action.items.map((item, index) =>
                item ? (
                  <Picker.Item
                    key={index}
                    label={item.toString()}
                    value={item}
                    fontFamily={"Outfit_600SemiBold"}
                    style={{
                      color: "white",
                      backgroundColor: Colors.dark.secondary,
                    }}
                  />
                ) : null
              )}
            </Picker>
            {action.label ? (
              <Text
                style={{
                  fontFamily: "Outfit_500Medium",
                  fontSize: 16,
                  color: "white",
                }}
              >
                {action.label}
              </Text>
            ) : null}
          </View>
          <ContainedButton
            title={action.button.text}
            onPress={() =>
              handleButtonClick({
                ...action.button,
                value: pickerValue,
              })
            }
            style={{
              flex: 1,
              paddingHorizontal: 0,
              paddingVertical: 7,
              borderRadius: 8,
              opacity: pickerValue === null ? 0.5 : 1,
            }}
            disabled={pickerValue === null}
          />
        </>
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
