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
  Dimensions,
} from "react-native";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
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
import { useAuth, useUser } from "@clerk/clerk-expo";
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
import CircularProgress, {
  LinearProgress,
} from "@/components/CircularProgress/CircularProgress";
import { Picker } from "@react-native-picker/picker";
import { TripMetadata } from "@/types/types";
import ModificationsModal from "./(menu-modals)/ModificationsModal";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

export default function Header() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const modificationsModalRef = useRef<BottomSheetModal>(null);

  const {
    assistant,
    pushAssistant,
    canPopAssistant,
    replaceAssistant,
    popAssistant,
    setConversation,
    clearAssistant,
    conversation,
    sendMessage,
  } = useAssistant();
  const { editor, setEditor } = useEditor();

  const { id } = useLocalSearchParams();
  const tripId = id as string;

  const { user } = useUser();

  const { tripMetadata } = useTrip();

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

  function handleSendMessage(
    textResponse?: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) {
    const message = inputValue;

    console.log("message: ", message);
    setInputFocused(false);
    setInputValue("");
    sendMessage(
      id as string,
      textResponse ? textResponse : message,
      customConversation,
      avoidConversationUpdate
    );
  }

  useEffect(() => {
    if (assistant.state === "speaking") {
      if (assistant.timeout) {
        const timer = setTimeout(() => {
          if (!assistant.timeout) return;
          switch (assistant.timeout.action) {
            case "clear":
              clearAssistant();
              break;
            case "pop":
              popAssistant();
              break;
            default:
              popAssistant();
              break;
          }
        }, assistant.timeout.duration);
        return () => clearTimeout(timer);
      }
    }
    if (assistant.state === "speaking" && assistant.modifications) {
      modificationsModalRef.current?.present();
    } else {
      modificationsModalRef.current?.dismiss();
    }
  }, [assistant]);

  // useEffect(() => {
  //   if (tripMetadata && tripMetadata.status === "new") {
  //     const conversation: FullConversation = {
  //       id: uuidv4(),
  //       type: "new",
  //       // options: {
  //       //   destination: destinationData,
  //       // },
  //       messages: [],
  //     };
  //     setConversation(conversation);
  //     pushAssistant({
  //       state: "speaking",
  //       key: `destination`,
  //       message: "Où partez-vous ?",
  //       action: {
  //         type: "list",
  //         items: [
  //           {
  //             text: "Road trip en Californie",
  //             action: "response",
  //           },
  //           {
  //             text: "Séjour à Malaga",
  //             action: "response",
  //           },
  //           {
  //             text: "Week-end à Paris",
  //             action: "response",
  //           },
  //         ],
  //       },
  //       followUp: {
  //         placeholder: "Une autre destination ?",
  //         autoFocus: true,
  //       },
  //     });
  //   }
  // }, [tripMetadata]);

  console.log("assistant", JSON.stringify(assistant, null, 2));

  return tripMetadata ? (
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
            }}
            // from={!isNewTrip ? { height: 50 } : { width: 35 }}
            from={{
              height: 50,
            }}
            animate={{
              height: contentHeight + 15,
              // width: isNewTrip ? 35 : "100%",
            }}
            transition={{
              type: "timing",
              duration: 300,
              delay: 0,
            }}
          >
            <BlurView
              tint="light"
              style={{
                width: "100%",
                borderRadius: 25,
                backgroundColor: "#f4fbffd4",
                // backgroundColor: "#eef8feb4",
                flexDirection: "row",
                justifyContent: "space-between",
                padding: 6.5,
                alignItems: "flex-start",
                borderWidth: 1,
                borderColor: "#A7C5D4",
                flex: 1,
                // shadowColor: "#79a8c3",
                // shadowOffset: {
                //   width: 0,
                //   height: 2,
                // },
                // shadowOpacity: 1,
                // shadowRadius: 3.84,
                // elevation: 5,
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
                          } else {
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
                        // backgroundColor: "#74A5B5",
                      }}
                    >
                      {assistant.state === "speaking" &&
                      assistant.timeout &&
                      assistant.timeout.action === "pop" ? (
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
                            duration={assistant.timeout.duration}
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
                        color={Colors.light.primary}
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
                {/* {!isNewTrip ? ( */}
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
                    !tripMetadata || tripMetadata.status === "new" ? (
                      <Text
                        style={{
                          color: Colors.light.primary,
                          // color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 16,
                          padding: 10,
                          paddingTop: 7.5,
                          paddingBottom: 7.5,
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        Nouveau voyage
                      </Text>
                    ) : (
                      <Input
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                        placeholder={assistant.placeholder}
                        onLayout={(e) => {
                          console.log(e.nativeEvent.layout.y);
                          followUpInputPosition.current =
                            e.nativeEvent.layout.y;
                        }}
                        value={inputValue}
                        onChangeText={(text) => setInputValue(text)}
                        onSubmit={() => handleSendMessage()}
                      />
                    )
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
                          color: Colors.light.primary,
                          // color: "white",
                          fontFamily: "Outfit_500Medium",
                          fontSize: 16,
                          width: "100%",
                        }}
                        numberOfLines={3}
                      >
                        {assistant.message}{" "}
                        {/* {assistant.action &&
                        assistant.action.type === "list" &&
                        assistant.action.checkbox ? (
                          <Text
                            style={{
                              color: "white",
                              fontFamily: "Outfit_400Regular",
                              fontSize: 14,
                              width: "100%",
                              opacity: 0.8,
                              lineHeight: 20,
                            }}
                          >
                            {`\n`}Sélectionnez une ou plusieurs réponses
                          </Text>
                        ) : null} */}
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
                          onResponse={(
                            response,
                            customConversation,
                            avoidConversationUpdate
                          ) =>
                            handleSendMessage(
                              response,
                              customConversation,
                              avoidConversationUpdate
                            )
                          }
                          onInputFocus={() => setInputFocused(true)}
                          onInputBlur={() => setInputFocused(false)}
                          onInputLayout={(e) => {
                            console.log(e.nativeEvent.layout.y);
                            followUpInputPosition.current =
                              e.nativeEvent.layout.y;
                          }}
                          inputValue={inputValue}
                          onInputChangeText={(text) => setInputValue(text)}
                        />
                      ) : null}
                      {assistant.followUp &&
                      !(
                        assistant.action?.type === "list" &&
                        assistant.action.checkbox
                      ) ? (
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
                          onSubmit={() => handleSendMessage()}
                        />
                      ) : null}
                      {/* </MotiView> */}
                    </View>
                  ) : null}
                </MotiView>
                {/* ) : null} */}
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
                          handleSendMessage();
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
                        // backgroundColor: inputFocused
                        //   ? Colors.light.accent
                        //   : "#74A5B5",
                      }}
                    >
                      {assistant.state === "speaking" &&
                      assistant.timeout &&
                      assistant.timeout.action === "clear" ? (
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
                            duration={assistant.timeout.duration}
                            color={Colors.light.accent}
                          />
                        </View>
                      ) : null}
                      <Icon
                        icon={
                          inputFocused
                            ? "sendIcon"
                            : canPopAssistant
                            ? "closeIcon"
                            : "menuIcon"
                        }
                        size={20}
                        color={Colors.light.primary}
                      />
                    </TouchableOpacity>
                  </MotiView>
                  {/* ) : null} */}
                </AnimatePresence>
              </View>
            </BlurView>
          </MotiView>
          {/* <MotiView
            style={{
              width: "100%",
              height: 50,
              marginTop: 10,
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
                borderColor: "#bddce9",
                flex: 1,
              }}
            >
              <View
                style={{
                  width: 35,
                }}
              ></View>
            </BlurView>
          </MotiView> */}
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
                top: -16,
                height: 90,
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
          pointerEvents: "box-none",
        }}
      >
        {/* <ContainedButton
          title="test"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "23",
              message: "Salut, ce message est temporaire !",
              timeout: {
                duration: 5000,
                action: "pop",
              },
              // action: {
              //   type: "list",
              //   items: [
              //     {
              //       text: "Cool !",
              //       action: "push",
              //       assistant: {
              //         state: "speaking",
              //         key: "24",
              //         message: "Salut",
              //         // timeout: {
              //         //   duration: 5000,
              //         //   action: "clear", 
              //         // },
              //       }
              //       // timeout: {
              //       //   duration: 5000,
              //       //   action: "replace",
              //       // },
              //     },
              //     {}
              //   ],
              // },
            });
          }}
        /> */}
        {/* <ContainedButton
          title="speak"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "23",
              message: "Salut !",
              action: {
                type: "list",
                checkbox: true,
                submit: {
                  text: "Valider",
                  action: "response",
                },
                items: [
                  {
                    text: "Ok",
                    action: "push",
                    assistant: {
                      state: "speaking",
                      key: "24",
                      message: "Ouaaaaaiiissss !",
                    },
                  },
                  {
                    text: "Pas ok",
                    action: "clear",
                  },
                  {
                    text: "Et pourquoi pas ?",
                    action: "pop",
                  },
                ],
              },
            });
          }}
        /> */}
        {/* <ContainedButton
          title="speak"
          onPress={() => {
            pushAssistant({
              state: "speaking",
              key: "23",
              message:
                "Excellente idée d'ajouter plus de culture et d'histoire à votre séjour à Malaga !",
              modifications: [
                {
                  day_index: 5,
                  day_id: "d-5",
                  location: "Malaga",
                  name: "Exploration de Malaga",
                  hotsport_id: null,
                  country: "Spain",
                  actions: [
                    {
                      name: "Centre Pompidou Malaga",
                      id: "4ea7186e-9e0c-403b-80ea-9adb764b2547",
                      action: "add",
                    },
                  ],
                },
              ],
            });
          }}
        /> */}
        {/* <ContainedButton
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
        /> */}
      </View>
      <MenuModal bottomSheetModalRef={bottomSheetModalRef} />
      <ModificationsModal bottomSheetModalRef={modificationsModalRef} />
      {/*<ShareModal bottomSheetModalRef={shareModalRef} /> */}
    </MotiView>
  ) : null;
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
          // color: "white",
          color: Colors.light.primary,
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
      placeholderTextColor="#083e4f7b"
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
  onResponse,
  onInputFocus,
  onInputBlur,
  onInputLayout,
  inputValue,
  onInputChangeText,
}: {
  action: ActionType;
  onResponse?: (
    response: string,
    customConversation?: FullConversation | null,
    avoidConversationUpdate?: boolean
  ) => void;
  onInputFocus: () => void;
  onInputBlur: () => void;
  onInputLayout: (e: LayoutChangeEvent) => void;
  inputValue: string;
  onInputChangeText: (text: string) => void;
}) {
  const {
    assistant,
    pushAssistant,
    clearAssistant,
    replaceAssistant,
    popAssistant,
  } = useAssistant();

  const [pickerValue, setPickerValue] = useState<number | string | null>(null);

  const [checked, setChecked] = useState<string[] | null>(null);

  useEffect(() => {
    console.log(checked);
  }, [checked]);
  console.log("action", action);

  async function handleButtonClick(clickAction: Button) {
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
    // if (clickAction.action === "next") {
    //   const res = await nextForm(
    //     assistantKey,
    //     clickAction.value ? clickAction.value.toString() : clickAction.text
    //   );
    //   if (res) {
    //     onResponse &&
    //       onResponse(
    //         clickAction.value ? clickAction.value.toString() : clickAction.text,
    //         res.conversation,
    //         true
    //       );
    //   }
    // }
    // if (clickAction.action === "validate-route") {
    //   clearAssistant();
    //   setTripMetadata((tripMetadata) => {
    //     return {
    //       ...(tripMetadata as TripMetadata),
    //       status: "trip.loading",
    //     };
    //   });
    //   favelClient(getToken).then(async (favel) => {
    //     if (tripMetadata && tripMetadata.route && conversation) {
    //       console.log(tripMetadata, tripMetadata.route);
    //       console.log("Creating trip");
    //       await favel.createTrip(
    //         id as string,
    //         tripMetadata.route,
    //         user!.id,
    //         conversation
    //       );
    //       replaceAssistant({
    //         state: "speaking",
    //         key: `trip-finished`,
    //         message: "Votre voyage est prêt !",
    //         timeout: {
    //           duration: 5000,
    //           action: "clear",
    //         },
    //       });
    //     }
    //   });
    // }
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
        <>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
              marginTop: 8,
            }}
          >
            {action.items.map((item, index) => (
              <ButtonComponent
                key={index}
                item={item}
                index={index}
                onPress={() => {
                  if (action.checkbox) {
                    console.log("checked", checked);
                    setChecked((checked) => {
                      if (checked?.includes(item.text)) {
                        // if (checked.length === 1) return null;
                        return checked?.filter((i) => i !== item.text);
                      } else {
                        return checked ? [...checked, item.text] : [item.text];
                      }
                    });
                  } else {
                    handleButtonClick(item);
                  }
                }}
                selected={checked?.includes(item.text)}
              />
            ))}
          </View>
          {/* {action.submit ? (
            <ContainedButton
              title={action.submit.text}
              // onPress={() =>
              //   // action.submit &&
              //   // handleButtonClick({
              //   //   ...action.submit,
              //   // })
              // }
              style={{
                flex: 1,
                marginTop: 10,
                paddingHorizontal: 0,
                paddingVertical: 7,
                borderRadius: 8,
                opacity: checked === null ? 0.5 : 1,
              }}
              disabled={checked === null}
            />
          ) : null} */}
          {action.checkbox ? (
            <>
              <Input
                onFocus={() => onInputFocus()}
                onBlur={() => onInputBlur()}
                dark
                style={{
                  marginTop: 8,
                }}
                onLayout={onInputLayout}
                value={inputValue}
                onChangeText={onInputChangeText}
                placeholder="Autre chose ?"
                // onSubmit={() => onResponse && onResponse(inputValue)}
              />
              <ContainedButton
                title="Valider"
                onPress={() =>
                  handleButtonClick({
                    text: checked?.join(", ") || "",
                    action: "response",
                  })
                }
                style={{
                  flex: 1,
                  paddingHorizontal: 0,
                  paddingVertical: 7,
                  borderRadius: 8,
                  opacity: !checked || checked?.length === 0 ? 0.5 : 1,
                  marginTop: 10,
                }}
                disabled={!checked || checked?.length === 0}
              />
            </>
          ) : null}
        </>
      ) : null}
      {/* {action.type === "select" ? (
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
      ) : null} */}
    </>
  );
}

function ButtonComponent({
  index,
  item,
  onPress,
  selected,
}: {
  index: number;
  item: Button;
  onPress: (item: Button) => void;
  selected?: boolean;
}) {
  useEffect(() => {
    if (item.timeout) {
      const timer = setTimeout(() => {
        onPress(item);
      }, item.timeout.duration);
      return () => clearTimeout(timer);
    }
  }, [item]);

  return (
    <View
      key={index}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: borderRadius,
      }}
    >
      {item.timeout ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LinearProgress
            duration={item.timeout.duration}
            color={Colors.light.accent}
            borderRadius={0}
          />
        </View>
      ) : null}
      <ContainedButton
        title={item.text}
        TitleComponent={
          // <View
          //   style={{
          //     flexDirection: "row",
          //     alignItems: "center",
          //     justifyContent: "center",
          //     flex: 1,
          //     gap: 10,
          //   }}
          // >
          <>
            {item.icon ? (
              <Text
                style={{
                  fontFamily: "Outfit_600Semibold",
                  fontSize: 16,
                  position: "absolute",
                  left: 10,
                }}
              >
                {item.icon}
              </Text>
            ) : null}
            <Text
              style={{
                color: Colors.light.primary,
                // color: "#dfebf9",
                fontFamily: "Outfit_600SemiBold",
                fontSize: 16,
                width: "100%",
                textAlign: "center",
              }}
            >
              {item.text}
            </Text>
          </>
          // </View>
        }
        onPress={() => onPress(item)}
        style={{
          paddingHorizontal: 0,
          paddingVertical: 7,
          borderRadius: 8,
        }}
        backgroundStyle={{
          backgroundColor: selected ? "#44c1e746" : "rgba(255, 255, 255, 0.1)",
          borderWidth: selected ? 3 : 0,
          borderColor: Colors.light.accent,
          borderRadius: 10,
        }}
        type={"ghost"}
      />
    </View>
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
          // color: "#dfebf9",
          color: Colors.light.primary,
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
          // color: "#dfebf9",
          color: Colors.light.primary,
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
