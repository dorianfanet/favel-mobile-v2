import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useTrip } from "@/context/tripContext";
import { NewTripFormProvider } from "@/context/newTrip";
import Form from "./Form";
import Route from "./route/Route";
import { NewTripChatProvider } from "@/context/newTripChatContext";
import { track } from "@amplitude/analytics-react-native";
import ChatSuggestions from "../components/ChatSuggestions";
import { borderRadius } from "@/constants/values";
import { TouchableOpacity } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { FullConversation, useAssistant } from "@/context/assistantContext";
import { TripMetadata } from "@/types/types";
import { v4 as uuidv4 } from "uuid";
import { useLocalSearchParams } from "expo-router";
import { favelClient } from "@/lib/favelApi";
import { useAuth } from "@clerk/clerk-expo";
import { AnimatePresence, MotiView } from "moti";
import { useTranslation } from "react-i18next";

export default function New() {
  const { t } = useTranslation();

  useEffect(() => {
    track("New trip page viewed");
  }, []);

  const { tripMetadata, setTripMetadata } = useTrip();
  const { sendMessage, pushAssistant } = useAssistant();

  const { id } = useLocalSearchParams();

  const [inputValue, setInputValue] = React.useState("");

  const { getToken } = useAuth();

  const [loading, setLoading] = React.useState(false);

  return tripMetadata!.status === "new" ? (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "position" : undefined}
      keyboardVerticalOffset={-100}
    >
      <AnimatePresence>
        {loading ? (
          <MotiView
            from={{
              opacity: 0,
              translateY: 100,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            exit={{
              opacity: 0,
              translateY: 100,
            }}
            transition={{
              type: "timing",
              duration: 300,
            }}
            style={{
              position: "absolute",
              width: "100%",
              bottom: 0,
              height: 350,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 40,
              // backgroundColor: keyboardStatus
              //   ? "transparent"
              //   : "rgba(0,0,0,0.5)",
            }}
          >
            <ActivityIndicator
              size="large"
              color="white"
            />
          </MotiView>
        ) : (
          <MotiView
            style={{
              position: "absolute",
              width: "100%",
              bottom: 0,
              height: 350,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              paddingBottom: 40,
              // backgroundColor: keyboardStatus
              //   ? "transparent"
              //   : "rgba(0,0,0,0.5)",
            }}
            from={{
              opacity: 0,
              translateY: 100,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            exit={{
              opacity: 0,
              translateY: 100,
            }}
            transition={{
              type: "timing",
              duration: 300,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontFamily: "Outfit_600SemiBold",
                color: "white",
                marginBottom: 20,
              }}
            >
              {t("trip.new.where_are_you_going")}
            </Text>
            {/* <ChatSuggestions
              data={suggestions}
              onPress={(destination) => {
                setForm((prev) => {
                  return {
                    ...(prev as FormType),
                    destination,
                  };
                });
                setTripMetadata((prev) => {
                  return {
                    ...(prev as TripMetadata),
                    status: "new.form",
                  };
                });
              }}
            /> */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                margin: 10,
                marginHorizontal: 20,
              }}
            >
              <TextInput
                style={{
                  height: 40,
                  borderRadius: borderRadius,
                  backgroundColor: "#1C344B",
                  padding: 10,
                  color: "white",
                  flex: 1,
                }}
                onChangeText={(text) => {
                  setInputValue(text);
                }}
                value={inputValue}
                placeholder={t("trip.new.your_destination")}
                placeholderTextColor={"#ffffff71"}
              />
              <TouchableOpacity
                onPress={async () => {
                  setLoading(true);

                  let destinationData;

                  await favelClient(getToken).then(async (favel) => {
                    const { data, error } = await favel
                      .assistant()
                      .destination(inputValue);

                    if (error) {
                      console.error(error);
                      return;
                    }

                    console.log("Destination data", data);

                    if (data) {
                      destinationData = data.type;
                      setTripMetadata((prev) => {
                        return {
                          ...(prev as TripMetadata),
                          route: data.route,
                        };
                      });
                      return;
                    }
                  });

                  const conversation: FullConversation = {
                    id: uuidv4(),
                    type: "new",
                    options: {
                      destination: destinationData,
                    },
                    messages: [
                      {
                        role: "assistant",
                        content: t("trip.new.where_are_you_going"),
                        key: "destination",
                      },
                    ],
                  };

                  sendMessage(id as string, inputValue, conversation);

                  setTripMetadata((prev) => {
                    return {
                      ...(prev as TripMetadata),
                      status: "new.form",
                    };
                  });

                  setLoading(false);

                  // pushAssistant({
                  //   state: "speaking",
                  //   key: "duration",
                  //   message: "Combien de temps partez-vous ?",
                  //   // action: {
                  //   //   type: "boolean",
                  //   //   primary: {
                  //   //     text: "Oui",
                  //   //     action: "follow-up",
                  //   //   },
                  //   //   secondary: {
                  //   //     text: "Non",
                  //   //     action: "clear",
                  //   //   },
                  //   // },
                  //   action: {
                  //     type: "select",
                  //     items: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                  //     label: "jours",
                  //     button: {
                  //       text: "Suivant",
                  //       action: "next",
                  //       value: null,
                  //     },
                  //   },
                  //   // followUp: true,
                  // });
                }}
                style={{
                  backgroundColor: Colors.light.accent, // Button color
                  // backgroundColor: "#0A84FF", // Button color
                  height: 40,
                  paddingHorizontal: 20,
                  borderRadius: borderRadius,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontFamily: "Outfit_600SemiBold",
                  }}
                >
                  {t("next")}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </KeyboardAvoidingView>
  ) : null;
}
