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
import { useTranslation } from "react-i18next";
import { supabaseClient } from "@/lib/supabaseClient";

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

  // useEffect(() => {
  //   if (assistant.state === "speaking") {
  //     if (assistant.timeout) {
  //       const timer = setTimeout(() => {
  //         if (!assistant.timeout) return;
  //         switch (assistant.timeout.action) {
  //           case "clear":
  //             clearAssistant();
  //             break;
  //           case "pop":
  //             popAssistant();
  //             break;
  //           default:
  //             popAssistant();
  //             break;
  //         }
  //       }, assistant.timeout.duration);
  //       return () => clearTimeout(timer);
  //     }
  //   }
  //   if (
  //     assistant.state === "speaking" &&
  //     assistant.modifications !== undefined
  //   ) {
  //     modificationsModalRef.current?.present();
  //   }
  //   console.log("assistant", assistant);
  //   if (assistant.state === "speaking" && !assistant.modifications) {
  //     modificationsModalRef.current?.dismiss();
  //   }
  // }, [assistant]);

  useEffect(() => {
    if (!tripMetadata) return;
    if (tripMetadata.status === "trip.loading" && tripMetadata.status_message) {
      if (tripMetadata.status_message.message === "stop") {
        replaceAssistant({
          state: "loading",
          key: "finishing",
          message: "Finishing up...",
        });
      } else {
        replaceAssistant({
          state: "loading",
          key: tripMetadata.status_message.message,
          message: tripMetadata.status_message.message,
        });
      }
    }
    if (tripMetadata.status === "trip") {
      console.log("Trip is ready !");
      clearAssistant();
      pushAssistant({
        state: "speaking",
        key: "trip",
        message: "Your trip is ready !",
        timeout: {
          duration: 5000,
          action: "pop",
        },
      });
    }
  }, [tripMetadata?.status_message, tripMetadata?.status]);

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
  const { t } = useTranslation();

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
        <ContainedButton
          title="Dismiss"
          onPress={() => {
            pushAssistant({
              state: "loading",
              key: `applying-modifications`,
              message: "Applying modifications...",
            });
          }}
        />
        <View
          style={{
            width: "100%",
            paddingHorizontal: padding,
            position: "relative",
          }}
        >
          <View
            style={{
              position: "absolute",
              left: padding,
              top: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                track("Back to home from trip");
                router.back();
              }}
              style={{
                flexDirection: "row",
                gap: 5,
                paddingVertical: 10,
                // backgroundColor: "#74A5B5",
              }}
            >
              <Icon
                icon={"chevronLeftIcon"}
                size={20}
                color={Colors.dark.primary}
              />
              <Text
                style={{
                  color: Colors.dark.primary,
                  fontFamily: "Outfit_500Medium",
                  fontSize: 16,
                  width: "100%",
                }}
              >
                {t("Back")}
              </Text>
            </TouchableOpacity>
          </View>
          <MotiView
            style={{
              width: "100%",
              opacity: 0,
            }}
            // from={!isNewTrip ? { height: 50 } : { width: 35 }}
            from={{
              height: 50,
            }}
            animate={{
              height: contentHeight + 15,
              opacity: tripMetadata && tripMetadata.status === "new" ? 0 : 1,
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
                borderColor: Colors.light.bottomSheetBorder,
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
                      (canPopAssistant || inputFocused) &&
                      !(
                        conversation?.messages.length === 3 &&
                        tripMetadata &&
                        tripMetadata.status === "new.form"
                      )
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
                        if (
                          (canPopAssistant || inputFocused) &&
                          !(
                            conversation?.messages.length === 3 &&
                            tripMetadata &&
                            tripMetadata.status === "new.form"
                          )
                        ) {
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
                            : (canPopAssistant || inputFocused) &&
                              !(
                                conversation?.messages.length === 3 &&
                                tripMetadata &&
                                tripMetadata.status === "new.form"
                              )
                            ? "chevronLeftIcon"
                            : "logoutIcon"
                        }
                        size={20}
                        color={Colors.light.primary}
                        style={{
                          transform: [
                            {
                              rotate:
                                (canPopAssistant || inputFocused) &&
                                !(
                                  conversation?.messages.length === 3 &&
                                  tripMetadata &&
                                  tripMetadata.status === "new.form"
                                )
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
                          modificationsModalRef={modificationsModalRef}
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
                          // dark
                          style={{
                            marginTop: 8,
                            backgroundColor: "rgba(8, 62, 79, 0.05)",
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
      selectionColor="#093947d1"
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
  modificationsModalRef,
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
  modificationsModalRef: React.MutableRefObject<BottomSheetModal | null>;
}) {
  const { t } = useTranslation();

  const {
    assistant,
    pushAssistant,
    clearAssistant,
    replaceAssistant,
    popAssistant,
    conversation,
  } = useAssistant();

  const [pickerValue, setPickerValue] = useState<number | string | null>(null);

  const [checked, setChecked] = useState<string[] | null>(null);

  useEffect(() => {
    console.log(checked);
  }, [checked]);
  console.log("action", action);

  const { getToken } = useAuth();
  const { tripMetadata, setTripMetadata } = useTrip();
  const { user } = useUser();
  const { id } = useLocalSearchParams();

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
    if (clickAction.action === "createTrip") {
      clearAssistant();
      pushAssistant({
        state: "loading",
        key: `trip-loading`,
        message: "Preparing your trip...",
      });
      if (!tripMetadata) return;
      if (tripMetadata && tripMetadata.route) {
        favelClient(getToken).then((favel) => {
          if (!tripMetadata.route) return;
          favel.createTripName(tripMetadata.route, id as string);
        });
      }
      favelClient(getToken).then((favel) => {
        if (tripMetadata.route && conversation) {
          console.log("Creating trip");
          favel.createTrip(
            id as string,
            tripMetadata.route,
            user!.id,
            conversation
          );
        }
      });
      supabaseClient(getToken).then(async (supabase) => {
        const { error } = await supabase
          .from("trips_v2")
          .update({
            status: "trip.loading",
            // dates: {
            //   type: "flexDates",
            //   duration: form.flexDates.duration,
            // },
          })
          .eq("id", id);
        if (error) {
          console.log(error);
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      setTripMetadata({
        ...(tripMetadata as TripMetadata),
        status: "trip.loading",
      });
    }
    if (clickAction.action === "applyModifications") {
      clearAssistant();
      pushAssistant({
        state: "loading",
        key: `applying-modifications`,
        message: "Applying modifications...",
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      modificationsModalRef.current?.dismiss();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      supabaseClient(getToken).then(async (supabase) => {
        const { error } = await supabase
          .from("trips_v2")
          .update({
            trip: [
              {
                id: "0204c3a0-f902-4887-bdc8-61c5f96b9d1f",
                day: 0,
                type: "day",
                location: "Downtown",
                hotspotId: "2e346f31-54d2-4a30-80b1-245a8e98e38c",
                activities: [
                  {
                    id: "5a94d305-4924-42ff-abda-beec1657ae03",
                    name: "Basilique Saint-Sernin de Toulouse",
                    type: "place",
                    dayId: "0204c3a0-f902-4887-bdc8-61c5f96b9d1f",
                    index: 0,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJkRk2cWC7rhIRx3ILZbNVPNk",
                    coordinates: {
                      latitude: 43.608315600000005,
                      longitude: 1.4418039,
                    },
                    avg_duration: 1.5,
                    display_category: "Basilique",
                  },
                  {
                    id: "0807c32e-f67b-4463-ae1c-3ae1fc5507a1",
                    name: "Musée des Augustins",
                    type: "place",
                    dayId: "0204c3a0-f902-4887-bdc8-61c5f96b9d1f",
                    index: 0,
                    polygon: null,
                    category: "museum",
                    g_maps_id: "ChIJm47EwJy8rhIRtd0DFFUgx7M",
                    coordinates: {
                      latitude: 43.6007949,
                      longitude: 1.4466789999999998,
                    },
                    avg_duration: 2,
                    display_category: "Musée d'art",
                  },
                  {
                    id: "5d10691b-34d8-4a03-b35f-318cd9e63ca4",
                    name: "Place du Capitole",
                    type: "unknown",
                    dayId: "0204c3a0-f902-4887-bdc8-61c5f96b9d1f",
                    index: 0,
                    polygon: null,
                    category: "entertainment",
                    g_maps_id: "ChIJIytxqpXHrhIRRCOODSRHtFM",
                    coordinates: {
                      latitude: 43.6043782,
                      longitude: 1.4433646999999998,
                    },
                    avg_duration: 2,
                    display_category: "Place publique",
                  },
                  {
                    name: "Balade sur le Canal du Midi",
                    id: "c2632b3e-8ca9-4c78-a055-f02759f9e5d8",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "3926188c-3e18-4039-89a7-13ef37cf7d34",
                day: 1,
                type: "day",
                location: "Les Carmes",
                hotspotId: "2e346f31-54d2-4a30-80b1-245a8e98e38c",
                activities: [
                  {
                    id: "325f7dc9-becf-4b6f-8384-05bdfb095750",
                    name: "Couvent des Jacobins",
                    type: "unknown",
                    dayId: "3926188c-3e18-4039-89a7-13ef37cf7d34",
                    index: 1,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJEbQhYGG7rhIRLt4mnjaYTHA",
                    coordinates: {
                      latitude: 43.603481599999995,
                      longitude: 1.4404850999999999,
                    },
                    avg_duration: 1.5,
                    display_category: "Couvent",
                  },
                  {
                    id: "e5bb22bb-d5ad-44ce-a563-78efb9a8875f",
                    name: "Lycée Pierre de Fermat",
                    type: "unknown",
                    dayId: "3926188c-3e18-4039-89a7-13ef37cf7d34",
                    index: 1,
                    polygon: null,
                    category: "neighbourhood",
                    g_maps_id: "ChIJQwom72O7rhIRqBRizFdsICE",
                    coordinates: {
                      latitude: 43.603132099999996,
                      longitude: 1.4390859,
                    },
                    avg_duration: 6,
                    display_category: "Lycée",
                  },
                  {
                    id: "a16f0cb3-a47d-458a-85dc-e8f9e5edc05f",
                    name: "Place de la Daurade",
                    dayId: "3926188c-3e18-4039-89a7-13ef37cf7d34",
                    index: 1,
                    category: "neighbourhood",
                    g_maps_id: "ChIJHRC_je67rhIRyDH-hN7N1pk",
                    coordinates: {
                      latitude: 43.601651499999996,
                      longitude: 1.439549,
                    },
                    avg_duration: 1,
                    display_category: "Place publique",
                  },
                  {
                    id: "a4d1cbe3-9862-40fd-8c48-0a3fd6b297d2",
                    name: "Café des Artistes",
                    type: "unknown",
                    dayId: "3926188c-3e18-4039-89a7-13ef37cf7d34",
                    index: 1,
                    polygon: null,
                    category: "restaurant",
                    g_maps_id: "ChIJKzTfeWO7rhIRawhl4RFCiLE",
                    coordinates: {
                      latitude: 43.601884299999995,
                      longitude: 1.4393327,
                    },
                    avg_duration: 2,
                    display_category: "Café artistique",
                  },
                  {
                    name: "Parc de la Grande Plaine",
                    id: "b8f02f8e-3a05-41a8-ac3a-c66fef1e795a",
                    action: "add",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "ef6de899-6246-4cf5-bb05-169e04c37878",
                day: 2,
                type: "day",
                location: "Saint-Cyprien",
                hotspotId: "2e346f31-54d2-4a30-80b1-245a8e98e38c",
                activities: [
                  {
                    id: "642ab089-f010-4c27-aa8a-dd6dd630a1c5",
                    name: "Prairie Des Filtres",
                    type: "place",
                    dayId: "ef6de899-6246-4cf5-bb05-169e04c37878",
                    index: 2,
                    polygon: null,
                    category: "nature",
                    g_maps_id: "ChIJwYh3y3u7rhIRlBXmUz6XTZU",
                    coordinates: {
                      latitude: 43.5958565,
                      longitude: 1.4368527,
                    },
                    avg_duration: 2,
                    display_category: "Parc",
                  },
                  {
                    id: "7143ad9b-114d-4ee5-aa59-383a68b54a57",
                    name: "Muséum de Toulouse",
                    type: "unknown",
                    dayId: "ef6de899-6246-4cf5-bb05-169e04c37878",
                    index: 2,
                    polygon: null,
                    category: "museum",
                    g_maps_id: "ChIJT3pwo4a8rhIRPGSdbax1l80",
                    coordinates: {
                      latitude: 43.5941,
                      longitude: 1.4492855999999998,
                    },
                    avg_duration: 2,
                    display_category: "Musée des sciences",
                  },
                  {
                    id: "c2d68006-51a3-4777-a8a3-e1811fd1d53e",
                    name: "LES BATEAUX TOULOUSAINS",
                    type: "unknown",
                    dayId: "ef6de899-6246-4cf5-bb05-169e04c37878",
                    index: 2,
                    polygon: null,
                    category: "entertainment",
                    g_maps_id: "ChIJYaHb8468rhIRwwqSelPERZU",
                    coordinates: {
                      latitude: 43.601181499999996,
                      longitude: 1.4387299,
                    },
                    avg_duration: 1.5,
                    display_category: "Balade",
                  },
                  {
                    id: "9c264cf8-29ef-41a7-a07e-7afd151f6acb",
                    name: "Les Chimères",
                    dayId: "ef6de899-6246-4cf5-bb05-169e04c37878",
                    index: 2,
                    category: "restaurant",
                    g_maps_id: "ChIJI3145Sm7rhIR2CVZQGKhXYI",
                    coordinates: {
                      latitude: 43.5976291,
                      longitude: 1.4315156,
                    },
                    avg_duration: 2,
                    display_category: "Restaurant",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "045030f8-8757-45ff-ae56-46bdf0f369c4",
                day: 3,
                type: "day",
                location: "Cité de Carcassonne",
                hotspotId: "b440d0d1-32ea-407e-9fe3-c65fb36dcbda",
                activities: [
                  {
                    id: "a0bbfc6c-3c97-43a0-a5ce-149e12ff65b1",
                    name: "Cité de Carcassonne",
                    type: "place",
                    dayId: "045030f8-8757-45ff-ae56-46bdf0f369c4",
                    index: 3,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJtzSv52osrhIRdMhoy9K25VI",
                    coordinates: {
                      latitude: 43.2060816,
                      longitude: 2.3641961,
                    },
                    avg_duration: 2,
                    display_category: "Cité médiévale",
                  },
                  {
                    id: "5f7a2090-e091-44ae-baa2-bc149ffd8e8d",
                    name: "Château Comtal",
                    type: "unknown",
                    dayId: "045030f8-8757-45ff-ae56-46bdf0f369c4",
                    index: 3,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJeVF44mosrhIRx02H3ycoLBU",
                    coordinates: {
                      latitude: 43.207051899999996,
                      longitude: 2.3631086999999997,
                    },
                    avg_duration: 1.5,
                    display_category: "Château historique",
                  },
                  {
                    id: "010bd791-7150-4f17-9ab0-8e7ecaf2ff2e",
                    name: "Basilique Saint-Nazaire",
                    type: "unknown",
                    dayId: "045030f8-8757-45ff-ae56-46bdf0f369c4",
                    index: 3,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJSTDHYmosrhIRZgAEamGHImQ",
                    coordinates: {
                      latitude: 43.2052778,
                      longitude: 2.3630556000000005,
                    },
                    avg_duration: 1.5,
                    display_category: "Monument historique",
                  },
                  {
                    id: "001c601e-ad77-4c3c-a48e-b9235271de20",
                    name: "Pont Vieux",
                    type: "unknown",
                    dayId: "045030f8-8757-45ff-ae56-46bdf0f369c4",
                    index: 3,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJW4SW8hUtrhIRgDjnZtMbY60",
                    coordinates: {
                      latitude: 43.2103651,
                      longitude: 2.3585381,
                    },
                    avg_duration: 0.5,
                    display_category: "Pont",
                  },
                  {
                    name: "Zoo de Montpellier",
                    id: "9d76f1e6-e960-4c94-b8ac-48f62f10f21d",
                    action: "add",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "355a9cf3-2fd2-48d5-98e7-6d717fb00355",
                day: 4,
                type: "day",
                location: "Carcassonne Centre",
                hotspotId: "b440d0d1-32ea-407e-9fe3-c65fb36dcbda",
                activities: [
                  {
                    id: "2058da71-5ee2-466d-b8a1-6d7d57c8a51e",
                    name: "Place Carnot",
                    type: "unknown",
                    dayId: "355a9cf3-2fd2-48d5-98e7-6d717fb00355",
                    index: 4,
                    polygon: null,
                    category: "entertainment",
                    g_maps_id: "ChIJ7Wn3_TksrhIRifgZVic9pcY",
                    coordinates: {
                      latitude: 43.213168499999995,
                      longitude: 2.3518296,
                    },
                    avg_duration: 1,
                    display_category: "Place du marché",
                  },
                  {
                    id: "b36362f4-e7b6-483b-994d-511fb5183fad",
                    name: "Halles Prosper Montagné",
                    type: "unknown",
                    dayId: "355a9cf3-2fd2-48d5-98e7-6d717fb00355",
                    index: 4,
                    polygon: null,
                    category: "entertainment",
                    g_maps_id: "ChIJ27yNZzcsrhIRsJ0vmXmkKxM",
                    coordinates: {
                      latitude: 43.212344699999996,
                      longitude: 2.3510199,
                    },
                    avg_duration: 1.5,
                    display_category: "Marché",
                  },
                  {
                    id: "3a93a976-d8ea-476a-ac2e-410d66122fb4",
                    name: "Musée des Beaux-Arts de Carcassonne",
                    type: "unknown",
                    dayId: "355a9cf3-2fd2-48d5-98e7-6d717fb00355",
                    index: 4,
                    polygon: null,
                    category: "museum",
                    g_maps_id: "ChIJCRCTbjksrhIRcgBKab6Za7k",
                    coordinates: {
                      latitude: 43.212458399999996,
                      longitude: 2.3552364999999997,
                    },
                    avg_duration: 2,
                    display_category: "Musée des Beaux-Arts",
                  },
                  {
                    id: "0203bd5c-9d87-4a5d-be1a-a05235ea5dbf",
                    name: "Église Saint-Vincent de Carcassonne",
                    type: "unknown",
                    dayId: "355a9cf3-2fd2-48d5-98e7-6d717fb00355",
                    index: 4,
                    polygon: null,
                    category: "monument",
                    g_maps_id: "ChIJjw_BwTAsrhIR7WMY9pdPN8c",
                    coordinates: {
                      latitude: 43.2146926,
                      longitude: 2.3502145999999997,
                    },
                    avg_duration: 1,
                    display_category: "Église",
                  },
                  {
                    name: "Parc Méric",
                    id: "c80101ba-6d90-42fd-b220-4793d115763c",
                    action: "add",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "df0b8443-ecde-4bbe-a3a0-4d64337be75c",
                day: 5,
                type: "day",
                location: "Écusson",
                hotspotId: "d54dedab-43b7-46be-81d8-07cee5c4d854",
                activities: [
                  {
                    id: "5a59e946-3c6f-460b-8b62-22ddd5f94df6",
                    name: "Place de la Comédie",
                    type: "unknown",
                    dayId: "df0b8443-ecde-4bbe-a3a0-4d64337be75c",
                    index: 5,
                    polygon: null,
                    category: "entertainment",
                    g_maps_id: "ChIJp9fGGaevthIRdxE3svrneQI",
                    coordinates: {
                      latitude: 43.6086545,
                      longitude: 3.8797773999999996,
                    },
                    avg_duration: 1.5,
                    display_category: "Place centrale",
                  },
                  {
                    id: "01f2055c-c930-4422-b641-b9babdd11ac5",
                    name: "Musée Fabre",
                    type: "unknown",
                    dayId: "df0b8443-ecde-4bbe-a3a0-4d64337be75c",
                    index: 5,
                    polygon: null,
                    category: "museum",
                    g_maps_id: "ChIJC4Wu9QmvthIRDmojjnJB6rA",
                    coordinates: {
                      latitude: 43.6116531,
                      longitude: 3.8801110999999997,
                    },
                    avg_duration: 2,
                    display_category: "Musée des beaux-arts",
                  },
                  {
                    id: "b7b53263-d913-4e45-9bda-2446e98f7b97",
                    name: "Promenade du Peyrou",
                    type: "place",
                    dayId: "df0b8443-ecde-4bbe-a3a0-4d64337be75c",
                    index: 5,
                    polygon: null,
                    category: "nature",
                    g_maps_id: "ChIJtW9UagevthIRqBfgUffh-TQ",
                    coordinates: {
                      latitude: 43.61125,
                      longitude: 3.8707581,
                    },
                    avg_duration: 0.5,
                    display_category: "Promenade",
                  },
                  {
                    name: "Randonnée Pic Saint-Loup",
                    id: "f8552008-9ad4-4d82-995f-cd38924a0814",
                    action: "add",
                  },
                ],
                formattedType: "day",
              },
              {
                id: "5c8dbbc2-057e-4c5b-88c8-59370f112326",
                day: 6,
                type: "day",
                location: "Port Marianne",
                hotspotId: "d54dedab-43b7-46be-81d8-07cee5c4d854",
                activities: [
                  {
                    id: "bcee56dc-a131-4c73-844b-cf0114029226",
                    name: "MO.CO. Panacée",
                    dayId: "5c8dbbc2-057e-4c5b-88c8-59370f112326",
                    index: 6,
                    category: "museum",
                    g_maps_id: "ChIJofpYVAivthIRXw08nwXMzco",
                    coordinates: {
                      latitude: 43.6125496,
                      longitude: 3.8781073,
                    },
                    avg_duration: 2,
                    display_category: "Centre d'art contemporain",
                  },
                  {
                    id: "65dc651a-3991-4e50-9919-db516509d892",
                    name: "Zèbre Bleu",
                    dayId: "5c8dbbc2-057e-4c5b-88c8-59370f112326",
                    index: 6,
                    category: "restaurant",
                    g_maps_id: "ChIJKxB4HhuwthIRdLBYa9Zth-s",
                    coordinates: {
                      latitude: 43.573769299999995,
                      longitude: 3.8958822,
                    },
                    avg_duration: 2,
                    display_category: "Restaurant",
                  },
                  {
                    name: "Plage de Palavas-les-Flots",
                    id: "96275165-650c-40fb-9bc0-cd6b76605c0d",
                    action: "add",
                  },
                ],
                formattedType: "day",
              },
            ],
          })
          .eq("id", id);
        if (error) {
          console.log(error);
        }

        replaceAssistant({
          state: "speaking",
          key: "trip-updated",
          message: "Your trip has been updated!",
          timeout: {
            duration: 4000,
            action: "clear",
          },
        });
      });
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
                // dark
                style={{
                  marginTop: 8,
                  backgroundColor: "rgba(8, 62, 79, 0.05)",
                }}
                onLayout={onInputLayout}
                value={inputValue}
                onChangeText={onInputChangeText}
                placeholder={t("something_else")}
                // onSubmit={() => onResponse && onResponse(inputValue)}
              />
              <ContainedButton
                title={t("next")}
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

            left: 0,
            right: 0,
            bottom: 0,
            height: 5,
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
          backgroundColor: selected ? "#44c1e746" : "rgba(8, 62, 79, 0.1)",
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
      key="fdshjjjy"
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
        {assistant.state === "loading" ? assistant.message : "Loading..."}
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
